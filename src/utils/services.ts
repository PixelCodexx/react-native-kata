import { request } from "./http";
import type { Service } from "./types";

export const getServices = () => request<Service[]>("/services");
