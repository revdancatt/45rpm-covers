/* global preloadImagesTmr $fx fxpreview fxhash fxrand paper1Loaded */

//
//  fxhash - 45rpm - LP Cover
//
//
//  HELLO!! Code is copyright revdancatt (that's me), so no sneaky using it for your
//  NFT projects.
//  But please feel free to unpick it, and ask me questions. A quick note, this is written
//  as an artist, which is a slightly different (and more storytelling way) of writing
//  code, than if this was an engineering project. I've tried to keep it somewhat readable
//  rather than doing clever shortcuts, that are cool, but harder for people to understand.
//
//  You can find me at...
//  https://twitter.com/revdancatt
//  https://instagram.com/revdancatt
//  https://youtube.com/revdancatt
//

// Global values, because today I'm being an artist not an engineer!
const ratio = 1 // canvas ratio
const features = {} //  so we can keep track of what we're doing
const nextFrame = null // requestAnimationFrame, and the ability to clear it
let resizeTmr = null // a timer to make sure we don't resize too often
let highRes = false // display high or low res
let drawStarted = false // Flag if we have kicked off the draw loop
let thumbnailTaken = false
let forceDownloaded = false
const urlSearchParams = new URLSearchParams(window.location.search)
const urlParams = Object.fromEntries(urlSearchParams.entries())
const prefix = '45rpm-single-cover'
// dumpOutputs will be set to false unless we have ?dumpOutputs=true in the URL
const dumpOutputs = urlParams.dumpOutputs === 'true'
// const startTime = new Date().getTime()

// Custom features go here
let full = false

window.$fxhashFeatures = {
  Release: 'mnml Ser I XTRA',
  rpm: '45',
  size: '7"'
}

const colours = [
  ['#2c3bad', '#4588d3', '#5dd5f9', '#3eb894', '#1e9a2e'], // Green/Blue
  ['#EDE342', '#F2BF6C', '#F69A97', '#FB76C1', '#FF51EB'], // Pink/Yellow
  ['#8e3b46', '#e1dd8f', '#e0777d', '#4c86a8', '#477890'], // Dusk
  ['#080705', '#362023', '#700548', '#7272ab', '#7899d4'], // Purple/Black
  ['#31393c', '#2176ff', '#33a1fd', '#fdca40', '#f79824'], // Blue/Yellow
  ['#5f0f40', '#9a031e', '#fb8b24', '#e36414', '#0f4c5c'], // Deep red/Purple/Orange
  ['#3BCFD4', '#6BC0A0', '#9CB16D', '#CCA239', '#FC9305'], // Green/Yellow/Orange
  ['#fa0000', '#f94000', '#f77f00', '#f9b308', '#fae60f'] // Red/Yellow
]
const black = ['#000', '#000', '#000', '#000', '#000']
const paletteNames = ['Green/Blue', 'Pink/Yellow', 'Dusk', 'Purple/Black', 'Blue/Yellow', 'Deep red/Purple/Orange', 'Green/Yellow/Orange', 'Red/Yellow']

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
const makeFeatures = () => {
  // features.background = 1
  features.paperOffset = {
    paper1: {
      x: fxrand(),
      y: fxrand()
    },
    paper2: {
      x: fxrand(),
      y: fxrand()
    }
  }
  features.showblackStrip = fxrand() < 0.66
  features.fullWidthBlackStrip = fxrand() < 0.25
  features.blackStripTextured = fxrand() < 0.75

  const sideStripPaletteNumber = Math.floor(fxrand() * colours.length)
  features.sideStripPalette = colours[sideStripPaletteNumber]
  if (fxrand() < 0.5) features.sideStripPalette.reverse()
  features.sideStripTextured = fxrand() < 0.75
  features.sideStripColourCount = Math.floor(fxrand() * 4) + 2

  features.topRight = 'gradient'
  const col2 = Math.floor(fxrand() * colours.length)
  features.topRightPrimaryPalette = colours[col2]
  if (fxrand() < 0.5) features.topRightPrimaryPalette.reverse()
  features.topRightSecondaryPalette = colours[col2]
  if (fxrand() < 0.5) features.topRightSecondaryPalette.reverse()
  features.topRightColourCount = Math.floor(fxrand() * 4) + 2
  features.topRightTextured = fxrand() < 0.75
  window.$fxhashFeatures['Primary stripes'] = false
  if (fxrand() < 0.66) {
    window.$fxhashFeatures['Primary stripes'] = true
    features.topRight = 'stripes'
    //  Work out if we are going to be black or not
    if (fxrand() < 0.5) features.topRightPrimaryPalette = black
  }

  //  The bottom left palette can either match the strip or the top right
  features.bottomLeftPalette = features.topRightPrimaryPalette
  window.$fxhashFeatures['Complimentary style'] = 'Primary blend'
  if (fxrand() < 0.5) {
    features.bottomLeftPalette = features.sideStripPalette
    window.$fxhashFeatures['Complimentary style'] = 'Stripe matching'
  }
  features.bottomLeftColourCount = Math.floor(fxrand() * 5) + 1
  features.bottomLeftTextured = fxrand() < 0.75

  //  Now we can possibly have a second feature on the right
  features.rightFormat = null
  features.rightPallete1Primary = null
  features.rightPallete1Secondary = null
  features.rightPallete2Primary = null
  features.rightPallete2Secondary = null

  //  Sometimes we have a right feature
  if (fxrand() < 0.666) {
    features.rightFormat = 'Single square'
    const featureChance = fxrand()
    if (featureChance < 0.75) features.rightFormat = 'Double square'
    if (featureChance < 0.50) features.rightFormat = 'Rectangle'
    if (featureChance < 0.25) features.rightFormat = 'Isometric'

    //  The single square can match either the top right or the strip palette
    features.rightPallete1Primary = features.topRightPrimaryPalette
    if (fxrand() < 0.5) features.rightPallete1Primary = features.sideStripPalette
    //  Make the secondary palette match the primary
    features.rightPallete1Secondary = features.topRightPrimaryPalette
    //  Sometimes revserse the primary and secondary
    if (fxrand() < 0.5) features.rightPallete1Primary.reverse()
    if (fxrand() < 0.5) features.rightPallete1Secondary.reverse()
    features.rightPallete1Count = Math.floor(fxrand() * (features.rightPallete1Primary.length - 1)) + 2
    features.rightPallete1Textured = fxrand() < 0.75

    //  The Second
    features.rightPallete2Primary = features.topRightPrimaryPalette
    if (fxrand() < 0.5) features.rightPallete2Primary = features.sideStripPalette
    features.rightPallete2Secondary = features.topRightPrimaryPalette
    //  If the feature in isometic then we pick two different random palettes
    if (features.rightFormat === 'Isometric') {
      features.rightPallete2Primary = colours[Math.floor(fxrand() * colours.length)]
      features.rightPallete2Secondary = colours[Math.floor(fxrand() * colours.length)]
    }
    //  Sometimes revserse the primary and secondary
    if (fxrand() < 0.5) features.rightPallete2Primary.reverse()
    if (fxrand() < 0.5) features.rightPallete2Secondary.reverse()
    features.rightPallete2Count = Math.floor(fxrand() * (features.rightPallete2Primary.length - 1)) + 2
    features.rightPallete2Textured = fxrand() < 0.75

    //  Work out the directions of the gradient
    features.rightPallete1PrimaryDirection = 'left-right'
    if (fxrand() < 0.666) features.rightPallete1PrimaryDirection = 'top-bottom'
    if (fxrand() < 0.333) features.rightPallete1PrimaryDirection = 'diagonal'
    features.rightPallete1SecondaryDirection = features.rightPallete1PrimaryDirection
    while (features.rightPallete1SecondaryDirection === features.rightPallete1PrimaryDirection) {
      features.rightPallete1SecondaryDirection = 'left-right'
      if (fxrand() < 0.666) features.rightPallete1SecondaryDirection = 'top-bottom'
      if (fxrand() < 0.333) features.rightPallete1SecondaryDirection = 'diagonal'
    }

    features.rightPallete2PrimaryDirection = 'left-right'
    if (fxrand() < 0.666) features.rightPallete2PrimaryDirection = 'top-bottom'
    if (fxrand() < 0.333) features.rightPallete2PrimaryDirection = 'diagonal'
    features.rightPallete2SecondaryDirection = features.rightPallete2PrimaryDirection
    while (features.rightPallete2SecondaryDirection === features.rightPallete2PrimaryDirection) {
      features.rightPallete2SecondaryDirection = 'left-right'
      if (fxrand() < 0.666) features.rightPallete2SecondaryDirection = 'top-bottom'
      if (fxrand() < 0.333) features.rightPallete2SecondaryDirection = 'diagonal'
    }
  }

  features.mirrored = fxrand() < 0.5
  features.rotate = 0
  features.flipX = 1
  features.flipY = 1
  //  sometimes flip
  if (fxrand() < 0.33) {
    features.flipX = -1
    features.mirrored = false
  }
  if (fxrand() < 0.33) {
    features.flipY = -1
    features.mirrored = false
  }
  //  Sometimes rotate
  if (fxrand() < 0.33) {
    features.rotate = Math.floor(fxrand() * 3) * 90 + 90
    features.mirrored = false
  }

  if (features.mirrored) {
    features.mirrorMode = 'normal'
    if (fxrand() < 0.5) features.mirrorMode = 'inside'
    if (fxrand() < 0.25) features.mirrorMode = 'outside'
  }
  if (features.rightFormat === 'Isometric' || features.rightFormat === null) {
    features.mirrored = false
  }

  window.$fxhashFeatures['Primary palette'] = paletteNames[col2]
  window.$fxhashFeatures['Side palette'] = paletteNames[sideStripPaletteNumber]
  window.$fxhashFeatures.Feature = features.rightFormat
  if (!window.$fxhashFeatures.Feature) window.$fxhashFeatures.Feature = 'None'
  window.$fxhashFeatures['Mirror mode'] = 'None'
  if (features.mirrored) {
    if (features.mirrorMode === 'normal') window.$fxhashFeatures['Mirror mode'] = 'Normal'
    if (features.mirrorMode === 'inside') window.$fxhashFeatures['Mirror mode'] = 'Inside'
    if (features.mirrorMode === 'outside') window.$fxhashFeatures['Mirror mode'] = 'Outside'
  }
}

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
makeFeatures()

const drawCanvas = async () => {
  //  Let the preloader know that we've hit this function at least once
  drawStarted = true
  // Grab all the canvas stuff
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  //  Lay down the first paper texture
  ctx.fillStyle = features.paper1Pattern

  ctx.save()
  ctx.translate(-w * features.paperOffset.paper1.x, -h * features.paperOffset.paper1.y)
  ctx.fillRect(0, 0, w * 2, h * 2)
  ctx.restore()

  //  Lay down the second paper texture
  ctx.globalCompositeOperation = 'darken'
  ctx.fillStyle = features.paper2Pattern

  ctx.save()
  ctx.translate(-w * features.paperOffset.paper1.x, -h * features.paperOffset.paper1.y)
  ctx.fillRect(0, 0, w * 2, h * 2)
  ctx.restore()

  ctx.globalCompositeOperation = 'source-over'

  //  Draw the album square
  const album = {
    x: Math.floor(w * 0.2),
    y: Math.floor(h * 0.15),
    w: Math.floor(w * 0.6 / 8) * 8,
    h: Math.floor(h * 0.6 / 8) * 8
  }

  if (full) {
    album.x = 0
    album.y = 0
    album.w = w
    album.h = h
  }

  const middle = {
    x: album.x + (album.w / 2),
    y: album.y + (album.h / 2)
  }

  //  Do the drop shadow
  ctx.fillStyle = 'black'
  ctx.fillRect(album.x, album.y, album.w, album.h)
  const grd = ctx.createLinearGradient(album.x, album.y + album.h, album.x, album.y + album.h + h * 0.1)
  grd.addColorStop(0, 'rgba(0, 0, 0, 0.666)')
  grd.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grd
  ctx.fillRect(album.x, album.y + album.h, album.w, h * 0.1)

  //  Now move origin to the middle
  ctx.save()
  ctx.translate(middle.x, middle.y)
  ctx.rotate(features.rotate * Math.PI / 180)
  ctx.scale(features.flipX, features.flipY)

  // #########################################################################
  //
  //  Do the top right corner
  //

  //  Fill in the whole background
  let primaryGrad = null
  let secondaryGrad = null

  ctx.fillStyle = features.paper1Pattern
  ctx.fillRect(album.x - middle.x, album.y - middle.y, album.w, album.h)

  if (features.topRight === 'gradient') {
    primaryGrad = ctx.createLinearGradient(album.x - middle.x, album.y - middle.y, album.x + album.w - middle.x, album.y - middle.y)
    const stopStep = 1 / (features.topRightColourCount - 1)
    for (let s = 0; s < features.topRightColourCount; s++) {
      primaryGrad.addColorStop(s * stopStep, features.topRightPrimaryPalette[Math.floor(s * stopStep * 4)])
    }
    ctx.fillStyle = primaryGrad
  }

  if (features.topRight === 'stripes') {
    primaryGrad = ctx.createLinearGradient(album.x + (album.w / 2) - middle.x, album.y + (album.h / 2) - middle.y, album.x + album.w - middle.x, album.y - middle.y)
    primaryGrad.addColorStop(0, features.topRightPrimaryPalette[3])
    primaryGrad.addColorStop(1, features.topRightPrimaryPalette[4])
    ctx.fillStyle = primaryGrad
  }
  if (features.topRightTextured) ctx.globalCompositeOperation = 'multiply'
  ctx.fillRect(album.x - middle.x, album.y - middle.y, album.w, album.h)
  ctx.globalCompositeOperation = 'source-over'

  //  Now put the stripes over the top, if that's what we're doing
  if (features.topRight === 'stripes') {
    secondaryGrad = ctx.createLinearGradient(album.x + (album.w / 2) - middle.x, album.y + (album.h / 2) - middle.y, album.x + album.w - middle.x, album.y - middle.y)
    const stopStep = 1 / (features.topRightColourCount - 1)
    for (let s = 0; s < features.topRightColourCount; s++) {
      secondaryGrad.addColorStop(s * stopStep, features.topRightSecondaryPalette[Math.floor(s * stopStep * 4)])
    }

    const smallStep = album.w / 16
    for (let p = 0; p < smallStep; p += 2) {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(album.x + p * smallStep - middle.x, album.y - middle.y)
      ctx.lineTo(album.x + ((p + 1) * smallStep) - middle.x, album.y - middle.y)
      ctx.lineTo(album.x - middle.x, album.y + ((p + 1) * smallStep) - middle.y)
      ctx.lineTo(album.x - middle.x, album.y + (p * smallStep) - middle.y)
      ctx.closePath()
      ctx.clip()
      //  Fill in the texture
      ctx.fillStyle = features.paper1Pattern
      ctx.fillRect(album.x - middle.x, album.y - middle.y, album.w, album.h)
      //  Now the colour
      if (features.topRightTextured) ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = secondaryGrad
      ctx.fillRect(album.x - middle.x, album.y - middle.y, album.w, album.h)
      //  Reset
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()
    }
  }

  // #########################################################################
  //
  //  Do the bottom left corner
  //
  ctx.save()

  ctx.beginPath()
  ctx.moveTo(album.x - middle.x, album.y - middle.y)
  ctx.lineTo(album.x + album.w - middle.x, album.y + album.h - middle.y)
  ctx.lineTo(album.x - middle.x, album.y + album.h - middle.y)
  ctx.closePath()
  ctx.clip()

  let bottomLeftGrad = ctx.createLinearGradient(album.x + album.w - middle.x, album.y + album.h - middle.y, album.x - middle.x, album.y - middle.y)
  if (features.bottomLeftColourCount > 1) {
    const stopStep = 1 / (features.bottomLeftColourCount - 1)
    for (let s = 0; s < features.bottomLeftColourCount; s++) {
      bottomLeftGrad.addColorStop(s * stopStep, features.bottomLeftPalette[Math.floor(s * stopStep * 4)])
    }
  } else {
    bottomLeftGrad = features.bottomLeftPalette[0]
  }

  //  Fill in the texture
  ctx.fillStyle = features.paper1Pattern
  ctx.fillRect(album.x - middle.x, album.y - middle.y, album.w, album.h)
  //  Now the colour
  if (features.bottomLeftTextured) ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = bottomLeftGrad
  ctx.fillRect(album.x - middle.x, album.y - middle.y, album.w, album.h)
  //  Reset
  ctx.globalCompositeOperation = 'source-over'

  ctx.restore()

  // #########################################################################
  //
  //  Do the side stripe
  //

  const stepSize = album.h / 8

  //  Do the side strip
  let stripGrad = ctx.createLinearGradient(album.x - middle.x, album.y - middle.y, album.x - middle.x, album.y + (stepSize * 7) - middle.y)
  stripGrad.addColorStop(0, features.sideStripPalette[3])
  stripGrad.addColorStop(1, features.sideStripPalette[4])
  //  Texture pass
  ctx.fillStyle = features.paper1Pattern
  ctx.fillRect(album.x - middle.x, album.y - middle.y, stepSize * 2, stepSize * 7)
  //  Colour pass
  if (features.sideStripTextured) ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = stripGrad
  ctx.fillRect(album.x - middle.x, album.y - middle.y, stepSize * 2, stepSize * 7)
  //  Reset
  ctx.globalCompositeOperation = 'source-over'

  //  Add the black strip
  if (features.showblackStrip) {
    //  Texture pass
    ctx.fillStyle = features.paper1Pattern
    ctx.fillRect(album.x - middle.x, album.y - middle.y, stepSize, stepSize * 7)
    if (features.fullWidthBlackStrip) ctx.fillRect(album.x - middle.x, album.y - middle.y, stepSize * 2, stepSize * 7)
    //  Colour pass
    if (features.sideStripTextured) ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'black'
    ctx.fillRect(album.x - middle.x, album.y - middle.y, stepSize, stepSize * 7)
    if (features.fullWidthBlackStrip) ctx.fillRect(album.x - middle.x, album.y - middle.y, stepSize * 2, stepSize * 7)
    //  Reset
    ctx.globalCompositeOperation = 'source-over'
  }

  //  The rest of the strips
  stripGrad = ctx.createLinearGradient(album.x - middle.x, album.y - middle.y, album.x - middle.x, album.y + (stepSize * 7) - middle.y)
  const stopStep = 1 / (features.sideStripColourCount - 1)
  for (let s = 0; s < features.sideStripColourCount; s++) {
    stripGrad.addColorStop(s * stopStep, features.sideStripPalette[Math.floor(s * stopStep * 4)])
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(album.x - middle.x, album.y - middle.y, stepSize * 2, stepSize * 7)
  ctx.clip()

  for (let s = 0; s < 4; s++) {
    ctx.beginPath()
    ctx.moveTo(album.x - middle.x, album.y + (((s * 2) - 1) * stepSize) - middle.y)
    ctx.lineTo(album.x + stepSize * 2 - middle.x, album.y + (((s * 2) + 1) * stepSize) - middle.y)
    ctx.lineTo(album.x + stepSize * 2 - middle.x, album.y + (((s * 2) + 2) * stepSize) - middle.y)
    ctx.lineTo(album.x - middle.x, album.y + (((s * 2) + 0) * stepSize) - middle.y)
    ctx.closePath()

    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = features.paper1Pattern
    ctx.fill()

    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = stripGrad
    ctx.fill()
  }
  ctx.restore()

  // #########################################################################
  //
  //  Do the opposite corner square
  //

  //  If we gave a rightFormat then we will start to draw that here
  let drawGrad = null
  if (features.rightFormat) {
    //  We will always have starting square
    //  Draw the texture
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = features.paper1Pattern //  The texture
    ctx.fillRect(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y, stepSize * 2, stepSize * 2) //  The square
    //  Draw the colour
    if (features.rightPallete1PrimaryDirection === 'left-right') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y, album.x + (stepSize * 6) - middle.x, album.y + (stepSize * 5) - middle.y)
    if (features.rightPallete1PrimaryDirection === 'top-bottom') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y, album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 7) - middle.y)
    if (features.rightPallete1PrimaryDirection === 'diagonal') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 7) - middle.y, album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 5) - middle.y)
    let stopStep = 1 / (features.rightPallete1Count - 1)
    for (let s = 0; s < features.rightPallete1Count; s++) {
      drawGrad.addColorStop(s * stopStep, features.rightPallete1Primary[Math.floor(s * stopStep * (features.rightPallete1Primary.length - 1))])
    }
    if (features.rightPallete1Textured) ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = drawGrad //  The colour
    ctx.fillRect(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y, stepSize * 2, stepSize * 2) //  The square
    //  Reset
    ctx.globalCompositeOperation = 'source-over'

    //  Now do the second half of the square
    //  Draw the texture
    ctx.globalCompositeOperation = 'source-over'
    //  Draw the colour
    if (features.rightPallete1SecondaryDirection === 'left-right') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y, album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 5) - middle.y)
    if (features.rightPallete1SecondaryDirection === 'top-bottom') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y, album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 7) - middle.y)
    if (features.rightPallete1SecondaryDirection === 'diagonal') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 7) - middle.y, album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 5) - middle.y)
    stopStep = 1 / (features.rightPallete1Count - 1)
    for (let s = 0; s < features.rightPallete1Count; s++) {
      drawGrad.addColorStop(s * stopStep, features.rightPallete1Secondary[Math.floor(s * stopStep * (features.rightPallete1Secondary.length - 1))])
    }
    ctx.fillStyle = drawGrad //  The colour
    ctx.beginPath()
    ctx.moveTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y)
    ctx.lineTo(album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 5) - middle.y)
    ctx.lineTo(album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 7) - middle.y)
    ctx.closePath()
    ctx.fill()
    //  Reset
    ctx.globalCompositeOperation = 'source-over'

    //  If we are drawing a double square then we need to do the second one here
    if (features.rightFormat === 'Double square') {
      //  Draw the texture
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = features.paper1Pattern //  The texture
      ctx.fillRect(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, stepSize * 2, stepSize * 2) //  The square
      //  Draw the colour
      if (features.rightPallete2PrimaryDirection === 'left-right') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 1) - middle.y)
      if (features.rightPallete2PrimaryDirection === 'top-bottom') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y)
      if (features.rightPallete2PrimaryDirection === 'diagonal') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y, album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 1) - middle.y)
      let stopStep = 1 / (features.rightPallete2Count - 1)
      for (let s = 0; s < features.rightPallete2Count; s++) {
        drawGrad.addColorStop(s * stopStep, features.rightPallete2Primary[Math.floor(s * stopStep * (features.rightPallete2Primary.length - 1))])
      }
      if (features.rightPallete2Textured) ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = drawGrad //  The colour
      ctx.fillRect(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, stepSize * 2, stepSize * 2) //  The square
      //  Reset
      ctx.globalCompositeOperation = 'source-over'

      //  Now do the second half of the square
      //  Draw the texture
      ctx.globalCompositeOperation = 'source-over'
      //  Draw the colour
      if (features.rightPallete2SecondaryDirection === 'left-right') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 1) - middle.y)
      if (features.rightPallete2SecondaryDirection === 'top-bottom') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y)
      if (features.rightPallete2SecondaryDirection === 'diagonal') drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y, album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 1) - middle.y)
      stopStep = 1 / (features.rightPallete2Count - 1)
      for (let s = 0; s < features.rightPallete2Count; s++) {
        drawGrad.addColorStop(s * stopStep, features.rightPallete2Secondary[Math.floor(s * stopStep * (features.rightPallete2Secondary.length - 1))])
      }
      ctx.fillStyle = drawGrad //  The colour
      ctx.beginPath()
      ctx.moveTo(album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 1) - middle.y)
      ctx.lineTo(album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.lineTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.closePath()
      ctx.fill()
      //  Reset
      ctx.globalCompositeOperation = 'source-over'
    }

    if (features.rightFormat === 'Rectangle') {
      //  Draw the texture
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = features.paper1Pattern //  The texture
      ctx.fillRect(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, stepSize * 2, stepSize * 4) //  The left side
      //  Draw the colour
      drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 4) - middle.y)
      let stopStep = 1 / (features.rightPallete2Count - 1)
      for (let s = 0; s < features.rightPallete2Count; s++) {
        drawGrad.addColorStop(s * stopStep, features.rightPallete2Primary[Math.floor(s * stopStep * (features.rightPallete2Primary.length - 1))])
      }
      if (features.rightPallete2Textured) ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = drawGrad //  The colour
      ctx.fillRect(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, stepSize * 2, stepSize * 4) //  The left side

      //  Draw the texture
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = features.paper1Pattern //  The texture
      ctx.fillRect(album.x + (stepSize * 6) - middle.x, album.y + (stepSize * 1) - middle.y, stepSize * 1, stepSize * 4) //  The right side
      //  Draw the colour
      drawGrad = ctx.createLinearGradient(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 1) - middle.y, album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 4) - middle.y)
      stopStep = 1 / (features.rightPallete2Count - 1)
      for (let s = 0; s < features.rightPallete2Count; s++) {
        drawGrad.addColorStop(1 - s * stopStep, features.rightPallete2Primary[Math.floor(s * stopStep * (features.rightPallete2Primary.length - 1))])
      }
      if (features.rightPallete2Textured) ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = drawGrad //  The colour
      ctx.fillRect(album.x + (stepSize * 6) - middle.x, album.y + (stepSize * 1) - middle.y, stepSize * 1, stepSize * 4) //  The left side
      ctx.globalCompositeOperation = 'source-over'
    }

    if (features.rightFormat === 'Isometric') {
      //  Draw the texture
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = features.paper1Pattern //  The texture
      ctx.beginPath()
      ctx.moveTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 7) - middle.y)
      ctx.lineTo(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.closePath()
      ctx.fill()

      drawGrad = ctx.createLinearGradient(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 3) - middle.y, album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y)
      stopStep = 1 / (features.rightPallete2Count - 1)
      for (let s = 0; s < features.rightPallete2Count; s++) {
        drawGrad.addColorStop(1 - s * stopStep, features.rightPallete2Primary[Math.floor(s * stopStep * (features.rightPallete2Primary.length - 1))])
      }
      if (features.rightPallete2Textured) ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = drawGrad //  The colour
      ctx.beginPath()
      ctx.moveTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 7) - middle.y)
      ctx.lineTo(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.closePath()
      ctx.fill()

      //  Draw the texture
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = features.paper1Pattern //  The texture
      ctx.beginPath()
      ctx.moveTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.lineTo(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.closePath()
      ctx.fill()

      drawGrad = ctx.createLinearGradient(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 3) - middle.y, album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 5) - middle.y)
      stopStep = 1 / (features.rightPallete2Count - 1)
      for (let s = 0; s < features.rightPallete2Count; s++) {
        drawGrad.addColorStop(1 - s * stopStep, features.rightPallete2Secondary[Math.floor(s * stopStep * (features.rightPallete2Secondary.length - 1))])
      }
      if (features.rightPallete2Textured) ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = drawGrad //  The colour
      ctx.beginPath()
      ctx.moveTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 7) - middle.x, album.y + (stepSize * 5) - middle.y)
      ctx.lineTo(album.x + (stepSize * 5) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.lineTo(album.x + (stepSize * 3) - middle.x, album.y + (stepSize * 3) - middle.y)
      ctx.closePath()
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  //  Move it around if mirroring
  if (features.mirrored) {
    if (features.mirrorMode === 'normal') {
      ctx.drawImage(canvas, album.x, album.y, album.w / 2, album.h, 0, -album.h / 2, album.w / 2, album.h)
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(canvas, album.x, album.y, album.w / 2, album.h, 0, -album.h / 2, album.w / 2, album.h)
      ctx.restore()
    }

    if (features.mirrorMode === 'inside') {
      ctx.drawImage(canvas, album.x + (album.w / 2), album.y, album.w / 2, album.h, -album.w / 2, -album.h / 2, album.w / 2, album.h)
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(canvas, album.x + (album.w / 2), album.y, album.w / 2, album.h, -album.w / 2, -album.h / 2, album.w / 2, album.h)
      ctx.restore()
    }

    if (features.mirrorMode === 'outside') {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(canvas, album.x + (album.w / 2), album.y, album.w / 2, album.h, 0, -album.h / 2, album.w / 2, album.h)
      ctx.restore()
    }
  }

  //  Restore it all
  ctx.restore()

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  //
  // Below is code that is common to all the projects, there may be some
  // customisation for animated work or special cases

  // Try various methods to tell the parent window that we've drawn something
  if (!thumbnailTaken) {
    try {
      $fx.preview()
    } catch (e) {
      try {
        fxpreview()
      } catch (e) {
      }
    }
    thumbnailTaken = true
  }

  // If we are forcing download, then do that now
  if (dumpOutputs || ('forceDownload' in urlParams && forceDownloaded === false)) {
    forceDownloaded = 'forceDownload' in urlParams
    await autoDownloadCanvas()
    // Tell the parent window that we have downloaded
    window.parent.postMessage('forceDownloaded', '*')
  } else {
    //  We should wait for the next animation frame here
    // nextFrame = window.requestAnimationFrame(drawCanvas)
  }
  //
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
// These are the common functions that are used by the canvas that we use
// across all the projects, init sets up the resize event and kicks off the
// layoutCanvas function.
//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//  Call this to start everything off
const init = async () => {
  // Resize the canvas when the window resizes, but only after 100ms of no resizing
  window.addEventListener('resize', async () => {
    //  If we do resize though, work out the new size...
    clearTimeout(resizeTmr)
    resizeTmr = setTimeout(async () => {
      await layoutCanvas()
    }, 100)
  })

  //  Now layout the canvas
  await layoutCanvas()
}

//  This is where we layout the canvas, and redraw the textures
const layoutCanvas = async (windowObj = window, urlParamsObj = urlParams) => {
  //  Kill the next animation frame (note, this isn't always used, only if we're animating)
  windowObj.cancelAnimationFrame(nextFrame)

  //  Get the window size, and devicePixelRatio
  const { innerWidth: wWidth, innerHeight: wHeight, devicePixelRatio = 1 } = windowObj
  let dpr = devicePixelRatio
  let cWidth = wWidth
  let cHeight = cWidth * ratio

  if (cHeight > wHeight) {
    cHeight = wHeight
    cWidth = wHeight / ratio
  }

  // Grab any canvas elements so we can delete them
  const canvases = document.getElementsByTagName('canvas')
  Array.from(canvases).forEach(canvas => canvas.remove())

  // Now set the target width and height
  let targetHeight = highRes ? 4096 : cHeight
  let targetWidth = targetHeight / ratio

  //  If the alba params are forcing the width, then use that (only relevant for Alba)
  if (windowObj.alba?.params?.width) {
    targetWidth = window.alba.params.width
    targetHeight = Math.floor(targetWidth * ratio)
  }

  // If *I* am forcing the width, then use that, and set the dpr to 1
  // (as we want to render at the exact size)
  if ('forceWidth' in urlParams) {
    targetWidth = parseInt(urlParams.forceWidth)
    targetHeight = Math.floor(targetWidth * ratio)
    dpr = 1
  }

  // Update based on the dpr
  targetWidth *= dpr
  targetHeight *= dpr

  //  Set the canvas width and height
  const canvas = document.createElement('canvas')
  canvas.id = 'target'
  canvas.width = targetWidth
  canvas.height = targetHeight
  document.body.appendChild(canvas)

  canvas.style.position = 'absolute'
  canvas.style.width = `${cWidth}px`
  canvas.style.height = `${cHeight}px`
  canvas.style.left = `${(wWidth - cWidth) / 2}px`
  canvas.style.top = `${(wHeight - cHeight) / 2}px`

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  //
  // Custom code (for defining textures and buffer canvas goes here) if needed
  //

  //  Re-Create the paper pattern
  const paper1 = document.createElement('canvas')
  paper1.width = canvas.width / 2
  paper1.height = canvas.height / 2
  const paper1Ctx = paper1.getContext('2d')
  await paper1Ctx.drawImage(paper1Loaded, 0, 0, 1920, 1920, 0, 0, paper1.width, paper1.height)
  features.paper1Pattern = paper1Ctx.createPattern(paper1, 'repeat')

  const paper2 = document.createElement('canvas')
  paper2.width = canvas.width / (22 / 7)
  paper2.height = canvas.height / (22 / 7)
  const paper2Ctx = paper2.getContext('2d')
  await paper2Ctx.drawImage(paper1Loaded, 0, 0, 1920, 1920, 0, 0, paper2.width, paper2.height)
  features.paper2Pattern = paper2Ctx.createPattern(paper2, 'repeat')

  drawCanvas()
}

//  This allows us to download the canvas as a PNG
// If we are forcing the id then we add that to the filename
const autoDownloadCanvas = async () => {
  const canvas = document.getElementById('target')

  // Create a download link
  const element = document.createElement('a')
  const filename = 'forceId' in urlParams
    ? `${prefix}_${urlParams.forceId.toString().padStart(4, '0')}_${fxhash}`
    : `${prefix}_${fxhash}`
  element.setAttribute('download', filename)

  // Hide the link element
  element.style.display = 'none'
  document.body.appendChild(element)

  // Convert canvas to Blob and set it as the link's href
  const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  element.setAttribute('href', window.URL.createObjectURL(imageBlob))

  // Trigger the download
  element.click()

  // Clean up by removing the link element
  document.body.removeChild(element)

  // Reload the page if dumpOutputs is true
  if (dumpOutputs) {
    window.location.reload()
  }
}

//  KEY PRESSED OF DOOM
document.addEventListener('keypress', async (e) => {
  e = e || window.event
  // == Common controls ==
  // Save
  if (e.key === 's') autoDownloadCanvas()

  //   Toggle highres mode
  if (e.key === 'h') {
    highRes = !highRes
    console.log('Highres mode is now', highRes)
    await layoutCanvas()
  }

  // Custom controls
  if (e.key === 'f') {
    full = !full
    console.log('Highres mode is now', highRes)
    await layoutCanvas()
  }
})

//  This preloads the images so we can get access to them
// eslint-disable-next-line no-unused-vars
const preloadImages = () => {
  //  Normally we would have a test
  // if (true === true) {
  if (paper1Loaded && !drawStarted) {
    clearInterval(preloadImagesTmr)
    init()
  }
}

console.table(window.$fxhashFeatures)
