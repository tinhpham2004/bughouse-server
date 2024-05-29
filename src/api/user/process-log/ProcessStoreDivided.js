const { smartHouseTopics, ifaceSmartHouse } = require("../web3/constans");

const ProcessStoreDivided = async (event, chainId) => {
  const eventTopic = event.topics[0];
  if (eventTopic === smartHouseTopics.RentStarted) {
    console.info(`smart house event ==> RentStarted`);
    const decoded = ifaceSmartHouse.decodeEventLog(
      "RentStarted",
      event.data,
      event.topics
    );
    const { _roomId, renter, _contractHash, _rentAmount, _deposit } = decoded;

    // await StoreDividedService.updateDistributeStatus(parseInt(id));
  }
};
