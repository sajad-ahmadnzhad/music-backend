import express from "express";
import singerModel from "../models/singer";
export let getAll = async (req: express.Request, res: express.Response) => {
  const singers = await singerModel.find().lean();
  res.json(singers);
};
export let create = async (req: express.Request, res: express.Response) => {};
export let search = async (req: express.Request, res: express.Response) => {};
export let update = async (req: express.Request, res: express.Response) => {};
export let remove = async (req: express.Request, res: express.Response) => {};
