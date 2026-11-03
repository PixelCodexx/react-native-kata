// Dates render in the device time zone; pin it so formatted output is stable.
module.exports = () => {
  process.env.TZ = "UTC";
};
