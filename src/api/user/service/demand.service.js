const ArgumentError = require("../../../exception/ArgumentError");
const MyError = require("../../../exception/MyError");
const NotFoundError = require("../../../exception/NotFoundError");
const Room = require("../../../model/room.model");
const ServiceDemand = require("../../../model/service/service-demand.model");
const Service = require("../../../model/service/service.model");
const Contract = require("../../../model/transaction/contract.model");
const commonHelper = require("../../../utils/common.helper");
const datetimeHelper = require("../../../utils/datetime.helper");
const objectHelper = require("../../../utils/object.helper");
const ServiceDemandValidate = require("../validate/demand.validate");
const roomValidate = require("../validate/room.validaste");

class ServiceDemandService {
  async createServiceDemand(serviceId, serviceDemandInfo) {
    const service = await Service.findById(serviceId).populate({
      path: "unit",
      select: "name",
    });

    if (!service) throw new MyError("Not found service!");

    const { basePrice, unit } = service;

    let serviceDemand = await ServiceDemandValidate.validateDemandInfo(
      serviceId,
      serviceDemandInfo
    );

    if (!serviceDemand) throw new MyError("Service demand Invalid");

    serviceDemand.amount = this.amountServiceDemand(
      serviceDemand.type,
      serviceDemand,
      basePrice
    );
    serviceDemand.save();
    return serviceDemand;
  }

  async getListServiceDemandRoomAtMonth(roomId, atMonth) {
    const { services } = await Room.findById(roomId).populate([
      {
        path: "services",
        select: "-updateAt",
      },
    ]);

    if (!services) throw new MyError("service not found");

    const serviceDemands = [];
    for (let i = 0; i < services.length; i++) {
      const demand = await ServiceDemand.getPresentService(
        services[i]._id,
        atMonth
      );
      serviceDemands.push(demand);
    }

    return serviceDemands;
  }

  async createServiceDemandForRoom(contractId) {
    if (!contractId) throw new ArgumentError("invoice service ==>");

    const contract = await Contract.getOne(contractId);
    console.log("🚀 ~ file: demand.service.js:68 ~ ServiceDemandService ~ createServiceDemandForRoom ~ contract:", contract);

    let { room, period, dateRent } = contract;

    const rentalDate = datetimeHelper.toObject(dateRent);

    let { expiredDate, services } = ServiceDemandValidate.validateCreateDemandForRoom({ room, period, dateRent });

    const listDemand = [];

    for (let serDemand of services) {
      for (let i = rentalDate.month; i <= expiredDate.month; i++) {
        let atYear = rentalDate.year;
        if (rentalDate.year < expiredDate.year) atYear = expiredDate.year;

        const demand = {
          newIndicator: 0,
          quality: 0,
          atMonth: i,
          atYear,
        };
        listDemand.push(await this.createServiceDemand(serDemand, demand));
      }
    }
    return listDemand;
  }

  async updateServiceDemandInvoice(roomId, demandInfo) {
    // get time to find list service Demand of room
    const room = await roomValidate.validRoom(roomId);
    if (!demandInfo) throw new ArgumentError("service demand ==> demandInfo ");

    const { services } = room;
    const { atMonth, demands } = demandInfo;
    const listDemand = [];
    for (let index = 0; index < services.length; index++) {
      for (let i = 0; i < demands.length; i++) {
        if (
          objectHelper.compare(
            services[index],
            commonHelper.toObjectId(demands[i].serviceId)
          )
        ) {
          listDemand.push(
            await this.updateServiceDemadEachMonth(atMonth, services[index], {
              newIndicator: demands[i].newIndicator,
              quality: demands[i].quality,
            })
          );
        }
      }
    }

    await Room.updateOne({ _id: roomId }, { demandAt: atMonth + 1 });

    const listServiceDemands = listDemand.map((val) => {
      return val._id;
    });
    return {
      listServiceDemands,
    };
  }

  async updateServiceDemadEachMonth(atMonth, serviceId, demandInfo) {
    let servicePreDemand = await ServiceDemand.getPresentService(
      serviceId,
      atMonth
    );
    if (!servicePreDemand)
      throw new NotFoundError("demand service => present demand service");

    const serviceLastDemand = await ServiceDemand.getLastService(
      serviceId,
      atMonth - 1
    );

    const { newIndicator, quality } =
      ServiceDemandValidate.validateUpdateDemandInfo(demandInfo);

    servicePreDemand.oldIndicator =
      serviceLastDemand !== null ? serviceLastDemand.newIndicator : 0;
    servicePreDemand.newIndicator = newIndicator;
    servicePreDemand.quality = quality;
    await servicePreDemand.save();

    await this.calculateDemandFee(servicePreDemand._id);
    return servicePreDemand;
  }

  async calculateDemandFee(serviceDemandId) {
    let serviceDemand = await ServiceDemand.getById(serviceDemandId);
    const { service, type } = serviceDemand;

    if (!service) throw new MyError("Not found service!");

    let amount = this.amountServiceDemand(
      type,
      serviceDemand,
      service.basePrice
    );
    serviceDemand.amount = amount;
    await serviceDemand.save({ new: true });
  }

  amountServiceDemand(type, serviceDemand, basePrice) {
    const QUALITY_TYPE = 0;
    const { oldIndicator, newIndicator, quality } = serviceDemand;
    switch (type) {
      case QUALITY_TYPE:
        return quality * basePrice;
      default:
        return (newIndicator - oldIndicator) * basePrice;
    }
  }
}

module.exports = new ServiceDemandService();
