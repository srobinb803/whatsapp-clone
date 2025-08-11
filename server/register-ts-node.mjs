import { register } from "node:module";
import { pathToFileURL } from "node:url";

// register the ts-node ESM loader from this project root
register("ts-node/esm", pathToFileURL("./"));
