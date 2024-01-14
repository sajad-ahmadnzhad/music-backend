import express from "express";
import musicModel from "./../models/music";
import { MusicBody } from "./../interfaces/music";
export let create = (req: express.Request, res: express.Response) => {
  const { title, artist, genre, duration, release_year, description } = <
    MusicBody
        >req.body;
    
};
