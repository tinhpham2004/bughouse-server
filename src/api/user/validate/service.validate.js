const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const NotFoundError = require('../../../exception/NotFoundError');
const Unit = require('../../../model/service/unit.model');
const Service = require('../../../model/service/service.model');
const InternalError = require('../../../exception/InternalError');
const commonUtils = require('../../../utils/common.helper');

const NAME_UNIT_EXIST_INVALID = 'Unit already exist';

const ServiceValidate = {
    /**
     * 
     * @param {*} param0 inbound:  description, name 
     * @returns unit
     */
    validateUnitInfo: async ({ description, name }) => {
        if (!(description && name))
            throw new MyError('validate unit ==> missing parameter');

        if (await Unit.findOne({ name }))
            throw new MyError(NAME_UNIT_EXIST_INVALID);

        return new Unit({
            description,
            name
        });
    },

    validateUnit: async (unitInfo) => {
        if (!unitInfo)
            throw new ArgumentError('valid unit =>');

        const unit = await Unit.findOne({ name: unitInfo })

        if (!unit)
            throw new NotFoundError('unit');
        return unit;
    },

    validateService: async (serviceInfo) => {
        let { name, description, basePrice, unitName } = serviceInfo;

        if (!(name && basePrice && unitName))
            throw new ArgumentError('valid service ==>');

        const unit = await ServiceValidate.validateUnit(unitName);

        basePrice = commonUtils.convertToNumber(basePrice);

        return new Service({
            name,
            description,
            basePrice,
            unit: unit._id
        })

    },

    validateListService: async (services) => {
        if (services.lenght === 0)
            throw new MyError('services is empty!');

        const listServices = services.map(async (val) => {
            val = await ServiceValidate.validateService(val);
        });

        if (!listServices)
            throw new InternalError('list service underfine');

        return listServices;
    }

}

module.exports = ServiceValidate;