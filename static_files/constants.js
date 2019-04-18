// global.port = 11090; // CHANGE ME
global.port = 10300; // CHANGE ME
global.wwWsPort = global.port + 1; // for websockets DON'T CHANGE
global.wwHostname = "cslinux.utm.utoronto.ca";
// global.wwHostname = "localhost"; // CHANGE ME
global.wwWsURL = "ws://" + global.wwHostname + ":" + global.wwWsPort; // DON'T CHANGE
