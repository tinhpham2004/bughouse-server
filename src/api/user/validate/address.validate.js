const City = require("../../../model/city.model");
const Ditrict = require("../../../model/ditrict.model");
const Street = require("../../../model/street.model");
const Ward = require("../../../model/ward.model");
const MyError = require("../../../exception/MyError");
const NotFoundError = require('../../../exception/NotFoundError');
const commonUtils = require('../../../utils/common.helper');

const validateAddress = {
    validDitrict: async (nameDitrict) => {
        if (!nameDitrict) { throw new MyError("valid ditrict ==> missing parameter"); }

        const ditrict = await Ditrict.findOne({ name: nameDitrict });

        if (!ditrict) { throw new MyError("Ditrict not found"); }
        return ditrict;
    },

    validWard: async (wardInfo) => {
        const { name, idCity, idDitrict } = wardInfo;

        if (!name || !idCity || !idDitrict) { throw new MyError("valid ward ==> missing parameter!"); }

        const ward = await Ward.findOne(
            {
                $or: [{ name: name }, { typename: name }],
                parent_code: idDitrict,
            },
        );
        if (!ward) { throw new NotFoundError("ward not fond!!"); }
        return ward;
    },

    validStreet: async (streetInfo) => {
        const { name, idCity, idDitrict } = streetInfo;
        if (!name || !idCity || !idDitrict) { throw new MyError("valid street ==> missing parameter!"); }

        const street = await Street.findOne(
            {
                name,
                parent_code: idDitrict,
                parent_city_code: idCity,
            },
        );

        if (!street) { throw new NotFoundError("street not found!"); }
        return street;
    },

    validAddress: async (addressInfo) => {
        const { cityName, ditrictName, streetName, wardName, addressDetail } = addressInfo;

        if (!(cityName && ditrictName && streetName && wardName && addressDetail))
            throw new MyError("valid address ==> missing parameter");

        const city = await City.findOne({ name: cityName });

        const ditrict = await validateAddress.validDitrict(ditrictName);

        const ward = await validateAddress.validWard({
            name: wardName,
            idCity: city._id,
            idDitrict: ditrict._id,
        });

        const street = await validateAddress.validStreet({
            name: streetName,
            idCity: city._id,
            idDitrict: ditrict._id,
        });

        if (!street)
            throw new NotFoundError("valid address ==> street not found!");

        return {
            city: city.name,
            district: ditrict.name,
            ward: ward.typename,
            street: street.name,
            addressDetail: addressDetail,
            fullText: `${addressDetail}, ${street.name}, ${ward.name}, ${ditrict.name}, ${city.name}`
        };
    },

};

module.exports = validateAddress;
