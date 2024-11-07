import CustomClient from "./base/classes/CustomClient";

process.on("uncaughtException", function(err) { console.error("uncaughtException (Node is alive)", err); });

(new CustomClient()).Init();