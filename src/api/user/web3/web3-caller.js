const { Contract, ethers, Wallet } = require("ethers");

class Web3Services {
  static provider = null;

  static createWeb3Provider (rpc) {
    if (!Web3Services.provider) {
      Web3Services.provider = new ethers.providers.JsonRpcProvider(rpc);
    }
    return Web3Services.provider;
  }

  static createSigner (privateKey) {
    return new Wallet(privateKey, provider);
  }

  static createContract (signer, address, abi) {
    return new Contract(address, abi, signer);
  }

  // static async retryFetchData(query, retries = 10, delay = 1000) {
  //   for (let i = 0; i < retries; i++) {
  //     try {
  //       return await Web3Services.fetchData(query);
  //     } catch (error) {
  //       console.error({
  //         name: "retry fetch data",
  //         query,
  //         error,
  //         attempt: i + 1,
  //       });
  //       await new Promise((resolve) => setTimeout(resolve, delay));
  //     }
  //   }
  //   return null;
  // }

  // static async retrySendTransaction(query, retries = 10, delay = 1000) {
  //   for (let i = 0; i < retries; i++) {
  //     try {
  //       return await Web3Services.sendTransaction(query);
  //     } catch (error) {
  //       console.error({
  //         name: "retry send data",
  //         query,
  //         error,
  //         attempt: i + 1,
  //       });
  //       await new Promise((resolve) => setTimeout(resolve, delay));
  //     }
  //   }
  //   return null;
  // }

  static async retryOperation (operation, retries = 10, delay = 1000) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await operation();
      } catch (error) {
        console.error(
          `Retry operation failed on attempt ${attempt + 1}:`,
          error
        );
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Implementing exponential backoff
      }
    }
    throw new Error("All retry attempts failed");
  }

  /**
   *
   * @param {string} rpc - The RPC URL.
   * @param {string} privateKey - The private key for the signer.
   * @param {string} contractAddress - The address of the contract.
   * @param {Array} abi - The ABI of the contract.
   * @param {string} methodName - The contract method to call.
   * @param {Array} params - Parameters for the contract method.
   * @returns
   */
  static async fetchData ({
    rpc,
    providerMethod,
    contractAddress,
    abi,
    nameFunction,
    params = [],
  }) {
    try {
      const provider = Web3Services.createWeb3Provider(rpc);

      if (providerMethod) {
        return await provider[providerMethod](...params);
      } else if (contractAddress && abi && nameFunction) {
        const contract = new Contract(contractAddress, abi, provider);
        return await contract[nameFunction](...params);
      } else {
        return null;
      }
    } catch (error) {
      console.error({ name: "error fetch data", query, error });
      throw error;
    }
  }

  /**
   * Sends a transaction to a specified contract.
   *
   * @param {Object} - The object.
   * @param {string} rpc - The RPC URL.
   * @param {string} privateKey - The private key for the signer.
   * @param {string} contractAddress - The address of the contract.
   * @param {Array} abi - The ABI of the contract.
   * @param {string} methodName - The contract method to call.
   * @param {Array} params - Parameters for the contract method.
   * @returns {Promise<Object>} The transaction receipt.
   */
  static async sendTransaction ({
    rpc,
    privateKey,
    contractAddress,
    abi,
    methodName,
    params = [],
  }) {
    try {
      // Create provider and signer
      const provider = Web3Services.createWeb3Provider(rpc);
      if (providerMethod) {
        const signer = new Wallet(privateKey, provider);
        // Create contract instance with signer
        const contract = new Contract(contractAddress, abi, signer);
        // Send transaction to the contract
        const txResponse = await contract[methodName](...params);
        return await txResponse.wait();
      }
      return null;
    } catch (error) {
      console.error({ name: "error sending transaction", transaction, error });
      throw error;
    }
  }
}

module.exports = Web3Services;

// clean this file to improve performance
