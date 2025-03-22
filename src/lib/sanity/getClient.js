import client from "@sanity/client";
import { config } from "./config";

// Standard client for fetching data
export const sanityClient = client(config);
