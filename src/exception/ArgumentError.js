class ArgumentError extends Error {
  constructor(...params) {
    super();
    this.status = 400;
    this.message = `${params} Params invalid`;
  }
}

module.exports = ArgumentError;
