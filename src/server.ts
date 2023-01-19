import express, { response } from "express";
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient()

app.get('/games', async (request, response) => {

  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true
        }
      }
    }
  })

  return response.json(games)
})

interface gameProps {
  title: string,
  bannerUrl: string
}

app.post('/games', async (request, response) => {
  const body: gameProps = request.body
  console.log(body)
  const game = await prisma.game.create({
    data: {
      title: body.title,
      bannerUrl: body.bannerUrl
    }
  })
  return response.status(201).json(game)
})

interface gameUpdateProps {
  title: string,
  bannerUrl: string,
  id: string
}

app.put('/games/update', async (request, response) => {
  const body: gameUpdateProps = request.body
  const game = await prisma.game.update({
    where: {
      id: body.id
    },
    data: {
      title: body.title,
      bannerUrl: body.bannerUrl
    }
  })
  return response.status(201).json(game)
})

interface gameDeleteProps {
  id: string,
}

app.delete('/games/delete', async (request, response) => {
  const body: gameDeleteProps = request.body
  console.log(body)
  const game = await prisma.game.delete({
    where: {
      id: body.id
    },
  })
  return response.status(201).json(game)
})

app.post('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id
  const body: any = request.body

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel
    }
  })

  return response.status(201).json(ad)
})

app.get('/games/:id/ads', async (request, response) => {

  const gameId = request.params.id

  const ads = await prisma.ad.findMany({

    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true
    },
    where: {
      gameId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return response.json(ads.map(ad => {

    // const transformDay = ad.weekDays.split(',')

    // const remap = transformDay.map(day => {
    //   if(day === '0'){
    //     return day = 'DOM'
    //   }
    //   if(day === '1'){
    //     return day = 'SEG'
    //   }
    //   if(day === '2'){
    //     return day = 'TER'
    //   }
    //   if(day === '3'){
    //     return day = 'QUA'
    //   }
    //   if(day === '4'){
    //     return day = 'QUI'
    //   }
    //   if(day === '5'){
    //     return day = 'SEX'
    //   }
    //   if(day === '6'){
    //     return day = 'SAB'
    //   }

    // })

    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd)
    }
  }))
})

app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true
    },
    where: {
      id: adId
    }
  })

  return response.json({
    discord: ad.discord
  })
})

app.get('/teste', async (required, response) => {
  const t = await prisma.teste.findMany({
    select: {
      id: true,
      name: true,
      age: true,
      getPackage: true
    }
  })
  return response.json(t)
})

app.listen(3333)