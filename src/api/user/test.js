const { https } = require("follow-redirects");
// const fs = require("fs");

const BASE_URL = "https://k3yq9e.api.infobip.com";
const API_KEY =
  "App 8ebc3ad16610ebbfd9bcc9a255a81b7f-591f69c2-a030-49a4-8336-3d990b46edc0";
const MEDIA_TYPE = "application/json";

const SENDER = "InfoSMS";
const RECIPIENT = "84961516941";
const MESSAGE_TEXT = "This is a otp";

const options = {
  method: "POST",
  hostname: "k3yq9e.api.infobip.com",
  host: BASE_URL,
  path: "/sms/2/text/advanced",
  headers: {
    Authorization: API_KEY,
    "Content-Type": MEDIA_TYPE,
    Accept: MEDIA_TYPE,
  },
  maxRedirects: 20,
};

const req = https.request(options, (res) => {
  const chunks = [];

  res.on("data", (chunk) => {
    chunks.push(chunk);
  });

  res.on("end", (chunk) => {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", (error) => {
    console.error(error);
  });
});

const postData = JSON.stringify({
  messages: [
    {
      destinations: [
        {
          to: RECIPIENT,
        },
      ],
      from: SENDER,
      text: MESSAGE_TEXT,
    },
  ],
});

req.write(postData);

req.end();

const express = require("express");
const app = express();

// Define your total supply and circulating supply data
const totalSupply = 1000000;
const circulatingSupply = 800000;

// Define the route handler for /supply
app.get("/supply", (req, res) => {
  const q = req.query.q;

  if (q === "totalSupply") {
    res.json({ supply: totalSupply });
  } else if (q === "circulating") {
    res.json({ supply: circulatingSupply });
  } else {
    res
      .status(400)
      .json({
        error:
          "Invalid query parameter q. Please provide either totalSupply or circulating.",
      });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const { key } = req.query;
const { mainTokenChainId } = await AppConfig.Main.get();
const rpc = (await ChainService.findByChainId(mainTokenChainId)).rpcs[0];
const { tokenA, claimToken } = await AppConfig.Contract.get();

StatisticHandler.getSupply = async (req) => {
  try {
    const { key } = req.query;
    const { mainTokenChainId } = await AppConfig.Main.get();
    const rpc = (await ChainService.findByChainId(mainTokenChainId)).rpcs[0];
    const { tokenA, claimToken } = await AppConfig.Contract.get();
    const totalSupply = await Web3Services.getTotalSupply({
      rpc,
      contractAddress: tokenA,
    });

    if (key === "circulating") {
      const balanceTokenA = await Web3Services.getTokenBalance({
        rpc,
        contractAddress: tokenA,
        userAddress: claimToken,
      });
      return convertWeiToBalance(
        calculateNumber(totalSupply, balanceTokenA, "minus", "string") || 0
      );
    }

    return convertWeiToBalance(totalSupply || 0);
  } catch (error) {
    console.log("Error in getSupply:", error);
    // Return appropriate fallback value or error message
  }
};

/**
 * In this refactored version, email and userAdminId are indexed, and email is set to be unique. Also, the userAdminId field type is explicitly set to Types.ObjectId for better type clarity.

Remember, the effectiveness of these changes largely depends on your specific use case, data access patterns, and the size of your dataset. You should monitor performance metrics after making these changes to ensure they have the desired effect. Additionally, be careful when adding indexes as they can increase the storage and maintenance overhead.
 They are beneficial for read-heavy workloads but can slightly slow down write operations.
 */
