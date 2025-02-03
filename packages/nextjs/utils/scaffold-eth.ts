import * as chains from "viem/chains";
import scaffoldConfig from "../scaffold.config";
import { notification } from "./notification";

export function getTargetNetworks(): chains.Chain[] {
  return scaffoldConfig.targetNetworks;
}

export { notification }; 