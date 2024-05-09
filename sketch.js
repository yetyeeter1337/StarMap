// BEHOLD MY GLORIOUS SPAGETTI
// ALL HAIL ARRAYS
// current version: v0.3.0 stations and trading
// working on: enviroment and hyper-jumping

// load fonts
var tomorrow_light;
var tomorrow_medium;
function preload() {
  tomorrow_light = loadFont("/Tomorrow-Light.ttf");
  tomorrow_medium = loadFont("/Tomorrow-Medium.ttf");
}

let themePrimary = [255, 255, 255];
let themeSecondary = [0, 90, 255];
let themeSecondaryDark = [0, 30, 150];
let themeTertiary = [245, 100, 20];
let themeTertiaryDark = [150, 30, 0];

let nThresh = 0.5; // noise threshold, setting this too high can cause the generation to fail
let Scount = 120; // star count
let seed = 302; // random generation seed
let Pstar = 1; // the current star
let Pstation = "null"; // the current station
let maxJump = 100;
let fuel = 500; // used for jumping and possibly other operations
let maxFuel = 1000; // maximum fuel tank capacity
let credits = 500; // currency
let cargoSlots = 8;
let maxStack = 50; // how much of a single item type will typically stack
let cargo = []; // resources and items
let maxModules = 6;
let modules = []; // ship upgrades
let weight = 100; // weight of ship, with modules and cargo
let maxWeight = 200; // the maximum weight that the ship can jump with, less weight uses less fuel

let paused = false // whether the game is paused
let FPScounter = false
let DTlog = []; // used to calculate the average FPS

let screen = "NONE";
let m = []; // star map positions
let inf = []; // star names
let cl = []; // star classes
let sys = []; // solar systems and planets, sys[solar system][planet][data]
let classes = [
  // star types
  "Red M-Class",
  "Red M-Class", // repeated to make it twice as common
  "Yellow M-Class",
  "Blue M-Class",
  "Red Giant",
  "Neutron Star",
  "White Dwarf",
];
let stations = []; // array of space stations
let industries = [
  // space station types
  "Mining",
  "Refining",
  "Technology",
  "Organics",
  "Manufacturing",
];
let commod = [
  // list of possible commodities, their typical prices, and where they are sold and bought, and it's weight per unit  commod[commodity][0 = name, 1 = typical price, 2 = [places it can be sold], 3 = [places it can be bought], 4 = weight, 5 = color]
  ["Hyper Fuel", 0.5, ["anywhere"], ["anywhere"], 1, [215, 50, 235]],
  ["Iron Ore", 2, ["Refining"], ["Mining"], 3, [100, 30, 5]],
  ["Copper Ore", 2, ["Refining"], ["Mining"], 3, [150, 100, 0]],
  ["Uranium Ore", 7, ["Refining"], ["Mining"], 4, [0, 240, 100]],
  ["Carbon Ore", 3, ["Refining"], ["Mining"], 2, [50, 50, 50]],
  ["Gold Ore", 7, ["Refining"], ["Mining"], 4, [200, 180, 0]],
  ["Ice", 3, ["Mining", "Refining"], ["Mining"], 3, [0, 40, 220]],
  [
    "Iron",
    5,
    ["Mining", "Refining", "Technology", "Manufacturing"],
    ["Refining"],
    5,
    [120, 130, 120],
  ],
  [
    "Copper",
    5,
    ["Mining", "Refining", "Technology", "Manufacturing"],
    ["Refining"],
    5,
    [230, 110, 0],
  ],
  [
    "Unenriched Uranium",
    10,
    ["Mining", "Refining", "Technology", "Manufacturing"],
    ["Refining"],
    5,
    [0, 240, 100],
  ],
  [
    "Enriched Uranium",
    25,
    ["Mining", "Refining", "Technology"],
    ["Refining", "Technology"],
    5,
    [0, 240, 100],
  ],
  [
    "Carbon",
    6,
    ["Mining", "Refining", "Technology", "Organics", "Manufacturing"],
    ["Refining"],
    3,
    [50, 50, 50],
  ],
  [
    "Gold",
    15,
    ["Mining", "Refining", "Technology", "Manufacturing"],
    ["Refining"],
    7,
    [200, 180, 0],
  ],
  ["Water", 4, ["anywhere"], ["anywhere"], 3, [0, 40, 220]],
  ["Hydrogen", 1, ["Refining"], ["Technology","Manufacturing"], 0.5, [235,235,255]],
  ["Oxygen", 1, ["Refining"], ["Technology","Manufacturing"], 0.5, [235,255,255]],
  ["Hull Plating", 10, ["anywhere"], ["Manufacturing"], 8, [140, 140, 145]],
  ["Motors", 12, ["Technology"], ["Manufacturing"], 3, [150, 130, 120]],
  ["Algae", 2, ["Technology"], ["Organics"], 2, [0, 130, 100]],
  ["FOODSNACK™", 2, ["anywhere"], ["Organics"], 1, [0, 150, 100]],
  ["Processors", 15, ["anywhere"], ["Technology"], 2, [230, 230, 230]],
  ["Solar Panels", 30, ["anywhere"], ["Technology"], 10, [10, 230, 230]],
];

var smeltables = [
  [2, "Iron Ore", 1, "Iron"],
  [2, "Copper Ore", 1, "Copper"],
  [2, "Carbon Ore", 1, "Carbon"],
  [2, "Gold Ore", 1, "Gold"],
  [2, "Ice", 1, "Water"],
];
function deepCopy(array) {
  return JSON.parse(JSON.stringify(array));
}

function getCommodity(name) {
  for (let i = 0; i < commod.length; i++) {
    if (commod[i][0] == name) {
      return deepCopy(commod[i]);
    }
  }
}

// joint system
let joints = []; // [0 = name, 1 = rotation, 2 = X, 3 = Y]

function jointOffset(name, X, Y) {
  let joint;
  for (let i = 0; i < joints.length; i++) {
    if (joints[i][0] == name) {
      joint = joints[i];
    }
  }
  if (joint == null) return;

  let Jr = joint[1];
  let Jx = joint[2];
  let Jy = joint[3];

  let x = cos(Jr) * Y + cos(Jr + 180 / 2) * X + Jx;
  let y = sin(Jr) * Y + sin(Jr + 180 / 2) * X + Jy;
  return [x, y];
}

function createJoint(name, R, X, Y) {
  joints[joints.length] = [name, R, X, Y];
}

function setJoint(name, R, X, Y) {
  for (let i = 0; i < joints.length; i++) {
    if (joints[i][0] == name) {
      joints[i] = [name, R, X, Y];
    }
  }
}

function linkJoint(name, linkName, R, L) {
  let joint;
  for (let i = 0; i < joints.length; i++) {
    if (joints[i][0] == name) {
      joint = i;
    }
  }
  if (joint == null) {
    print("no joint");
    return;
  }

  let link;
  for (let i = 0; i < joints.length; i++) {
    if (joints[i][0] == linkName) {
      link = i;
    }
  }
  if (link == null) {
    print("no link");
    return;
  }

  let r = joints[link][1] + R;
  let x = cos(r) * L + joints[link][2];
  let y = sin(r) * L + joints[link][3];

  joints[joint] = [name, r, x, y];

  if (debug) {
    line(joints[link][2], joints[link][3], joints[joint][2], joints[joint][3]);
  }
}

function pointsLine(POINT1, POINT2) {
  line(POINT1[0], POINT1[1], POINT2[0], POINT2[1]);
}

function pointsTriangle(POINT1, POINT2, POINT3) {
  triangle(POINT1[0], POINT1[1], POINT2[0], POINT2[1], POINT3[0], POINT3[1]);
}

// might be a bit weird due to the order of the diagonals not being specified
function pointsRectangle(POINT1,POINT2,POINT3,POINT4){
  pointsLine(POINT1,POINT2)
  pointsLine(POINT2,POINT3)
  pointsLine(POINT3,POINT4)
  pointsLine(POINT4,POINT1)
  noStroke()
  pointsTriangle(POINT1,POINT2,POINT3)
  pointsTriangle(POINT1,POINT4,POINT3)
  stroke(STROKE)
}

function triangleArea(x1,y1,x2,y2,x3,y3){
  x1 = round(x1,3)
  y1 = round(y1,3)
  x2 = round(x2,3)
  y2 = round(y2,3)
  x3 = round(x3,3)
  y3 = round(y3,3)
  return (1/2)*abs(x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2))
}

function checkTrianglePoint(x1,y1,x2,y2,x3,y3,px,py){
  let area = triangleArea(x1,y1,x2,y2,x3,y3)
  
  px = round(px,3)
  py = round(py,3)
  
  if(area + 0.01 >= triangleArea(px,py,x2,y2,x3,y3)+triangleArea(x1,y1,px,py,x3,y3)+triangleArea(x1,y1,x2,y2,px,py)){
    return true
  } else {
    return false
  }
}

var cameraPos = [0,0]

var canDock = false;
var docked = false;
var shipJoint;


var playerShip;
var asteroid;
var station;
var dockingPort;

var speed = 0.5;
var turn = 0.0005;

function createStation(lightCol){
  station = new Sprite(random(150, 300),random(-200,200),100,100)
  station.diameter = 150
  station.collider = "static"
  station.color = color(10,10,15,255)
  station.stroke = color(200)
  station.spinSpeed = 10 // custom value, determines the visual rotation speed of the station and the orbit speed of docking ports
  station.lightColor = lightCol
  station.allowSleeping = false;
  
  dockingPort1 = new Sprite(station.x + station.diameter/2,station.y,20,20)
  dockingPort1.collider = "kinematic"
  dockingPort1.color = color(10,10,15)
  dockingPort1.stroke = color(200)
  dockingPort1.station = "station"
  dockingPort1.strokeWeight = 0.2
  
  dockingPort2 = new Sprite(station.x - station.diameter/2,station.y,20,20)
  dockingPort2.collider = "kinematic"
  dockingPort2.color = color(10,10,15)
  dockingPort2.stroke = color(200)
  dockingPort2.station = "station"
  dockingPort2.strokeWeight = 0.2
  
  dockingPort3 = new Sprite(station.x,station.y - station.diameter/2,20,20)
  dockingPort3.collider = "kinematic"
  dockingPort3.color = color(10,10,15)
  dockingPort3.stroke = color(200)
  dockingPort3.station = "station"
  dockingPort3.strokeWeight = 0.2
  
  dockingPort4 = new Sprite(station.x,station.y + station.diameter/2,20,20)
  dockingPort4.collider = "kinematic"
  dockingPort4.color = color(10,10,15)
  dockingPort4.stroke = color(200)
  dockingPort4.station = "station"
  dockingPort4.strokeWeight = 0.2
}


createJoint("dockingPort1",0,0,0)
createJoint("dockingPort2",0,0,0)
createJoint("dockingPort3",0,0,0)
createJoint("dockingPort4",0,0,0)
createJoint("station",0,0,0)
function updateStation(){
  let x = dockingPort1.x - station.x
  let y = dockingPort1.y - station.y
  
  let angle = atan(y/x)
  if(x > 0) angle = angle + 180
  angle += 90
  
  dockingPort1.direction = angle
  dockingPort1.speed = (station.spinSpeed/360) * PI * (station.diameter/60)
  dockingPort1.rotation = angle
  setJoint("dockingPort1",angle,dockingPort1.x,dockingPort1.y)
  // prevents the docking port from drifting off into space due to imprecision
  if(dist(station.x,station.y,dockingPort1.x,dockingPort1.y) > (station.diameter/2) + 0.5){
    dockingPort1.x = station.x + cos(angle+90)*(station.diameter/2);
    dockingPort1.y = station.y + sin(angle+90)*(station.diameter/2);
  }
  
  let p1 = jointOffset("dockingPort1",10,10)
  let p2 = jointOffset("dockingPort1",10,-10)
  let p3 = jointOffset("dockingPort1",30,10)
  let p4 = jointOffset("dockingPort1",30,-10)
  
  if(checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p2[0],p2[1],playerShip.x,playerShip.y) ||
    checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p3[0],p3[1],playerShip.x,playerShip.y) ) {
    canDock = true;
    if(kb.pressed("e") && !docked){
      docked = true;
      shipJoint = new GlueJoint(playerShip, dockingPort2)
      shipJoint.visible = false;
      buttonsLoaded = false
      screen = "STATION"
    } else if((kb.pressed("e") || kb.pressed("escape")) && docked) {
      shipJoint.remove()
      screen = "NONE"
      buttonsLoaded = false;
      clearButtons()
      docked = false;
      TS = 0;
    }
  }
  
  
  angle += 90
  
  dockingPort3.direction = angle
  dockingPort3.speed = (station.spinSpeed/360) * PI * (station.diameter/60)
  dockingPort3.rotation = angle
  setJoint("dockingPort3",angle,dockingPort3.x,dockingPort3.y)
  // prevents the docking port from drifting off into space due to imprecision
  if(dist(station.x,station.y,dockingPort3.x,dockingPort3.y) > (station.diameter/2) + 0.5){
    dockingPort3.x = station.x + cos(angle+90)*(station.diameter/2);
    dockingPort3.y = station.y + sin(angle+90)*(station.diameter/2);
  }
  
  p1 = jointOffset("dockingPort3",10,10)
  p2 = jointOffset("dockingPort3",10,-10)
  p3 = jointOffset("dockingPort3",30,10)
  p4 = jointOffset("dockingPort3",30,-10)
  
  if(checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p2[0],p2[1],playerShip.x,playerShip.y) ||
    checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p3[0],p3[1],playerShip.x,playerShip.y) ) {
    canDock = true;
    if(kb.pressed("e") && !docked){
      docked = true;
      shipJoint = new GlueJoint(playerShip, dockingPort2)
      shipJoint.visible = false;
      buttonsLoaded = false
      screen = "STATION"
    } else if((kb.pressed("e") || kb.pressed("escape")) && docked) {
      shipJoint.remove()
      screen = "NONE"
      buttonsLoaded = false;
      clearButtons()
      docked = false;
      TS = 0;
    }
  }
  
  angle += 90
  
  dockingPort2.direction = angle
  dockingPort2.speed = (station.spinSpeed/360) * PI * (station.diameter/60)
  dockingPort2.rotation = angle
  setJoint("dockingPort2",angle,dockingPort2.x,dockingPort2.y)
  // prevents the docking port from drifting off into space due to imprecision
  if(dist(station.x,station.y,dockingPort2.x,dockingPort2.y) > (station.diameter/2) + 0.5){
    dockingPort2.x = station.x + cos(angle+90)*(station.diameter/2);
    dockingPort2.y = station.y + sin(angle+90)*(station.diameter/2);
  }
  
  p1 = jointOffset("dockingPort2",10,10)
  p2 = jointOffset("dockingPort2",10,-10)
  p3 = jointOffset("dockingPort2",30,10)
  p4 = jointOffset("dockingPort2",30,-10)
  
  if(checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p2[0],p2[1],playerShip.x,playerShip.y) ||
    checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p3[0],p3[1],playerShip.x,playerShip.y) ) {
    canDock = true;
    if(kb.pressed("e") && !docked){
      docked = true;
      shipJoint = new GlueJoint(playerShip, dockingPort2)
      shipJoint.visible = false;
      buttonsLoaded = false
      screen = "STATION"
    } else if((kb.pressed("e") || kb.pressed("escape")) && docked) {
      shipJoint.remove()
      screen = "NONE"
      buttonsLoaded = false;
      clearButtons()
      docked = false;
      TS = 0;
    }
  }
  
  angle += 90
  
  dockingPort4.direction = angle
  dockingPort4.speed = (station.spinSpeed/360) * PI * (station.diameter/60)
  dockingPort4.rotation = angle
  setJoint("dockingPort4",angle,dockingPort4.x,dockingPort4.y)
  // prevents the docking port from drifting off into space due to imprecision
  if(dist(station.x,station.y,dockingPort4.x,dockingPort4.y) > (station.diameter/2) + 0.5){
    dockingPort4.x = station.x + cos(angle+90)*(station.diameter/2);
    dockingPort4.y = station.y + sin(angle+90)*(station.diameter/2);
  }
  
  p1 = jointOffset("dockingPort4",10,10)
  p2 = jointOffset("dockingPort4",10,-10)
  p3 = jointOffset("dockingPort4",30,10)
  p4 = jointOffset("dockingPort4",30,-10)
  
  if(checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p2[0],p2[1],playerShip.x,playerShip.y) ||
    checkTrianglePoint(p1[0],p1[1],p4[0],p4[1],p3[0],p3[1],playerShip.x,playerShip.y) ) {
    canDock = true;
    if(kb.pressed("e") && !docked){
      docked = true;
      shipJoint = new GlueJoint(playerShip, dockingPort2)
      shipJoint.visible = false;
      buttonsLoaded = false
      screen = "STATION"
    } else if((kb.pressed("e") || kb.pressed("escape")) && docked) {
      shipJoint.remove()
      screen = "NONE"
      buttonsLoaded = false;
      clearButtons()
      docked = false;
      TS = 0;
    }
  }
  
  
  setJoint("station",angle,0,0)
  
  // custom draw code for the station
  station.draw = () => {
    
    noFill()
    stroke(station.stroke)
    strokeWeight(0.4)
    pointsRectangle(
      jointOffset("station",-station.diameter/20,0),
      jointOffset("station",station.diameter/20,0),
      jointOffset("station",station.diameter/20,(station.diameter/2)-(station.diameter/20)),
      jointOffset("station",-station.diameter/20,(station.diameter/2)-(station.diameter/20))
    )
    pointsRectangle(
      jointOffset("station",-station.diameter/20,0),
      jointOffset("station",station.diameter/20,0),
      jointOffset("station",station.diameter/20,-(station.diameter/2)+(station.diameter/20)),
      jointOffset("station",-station.diameter/20,-(station.diameter/2)+(station.diameter/20))
    )
    pointsRectangle(
      jointOffset("station",0,-station.diameter/20),
      jointOffset("station",0,station.diameter/20),
      jointOffset("station",(station.diameter/2)-(station.diameter/20),station.diameter/20),
      jointOffset("station",(station.diameter/2)-(station.diameter/20),-station.diameter/20)
    )
    pointsRectangle(
      jointOffset("station",0,-station.diameter/20),
      jointOffset("station",0,station.diameter/20),
      jointOffset("station",-(station.diameter/2)+(station.diameter/20),station.diameter/20),
      jointOffset("station",-(station.diameter/2)+(station.diameter/20),-station.diameter/20)
    )
    strokeWeight(1)
    
    noFill()
    stroke(station.color)
    strokeWeight(station.diameter/6)
    circle(0,0,station.diameter-(station.diameter/6))
    fill(station.color)
    noStroke()
    circle(0,0,station.diameter/3)
    
    stroke(station.stroke)
    strokeWeight(0.2)
    noFill()
    stroke(station.stroke)
    circle(0,0,station.diameter-(station.diameter/3))
    noFill()
    stroke(station.stroke)
    circle(0,0,station.diameter)
    circle(0,0,station.diameter/3)
    
    fill(station.color)
    noStroke()
    pointsRectangle(
      jointOffset("station",-station.diameter/20,0),
      jointOffset("station",station.diameter/20,0),
      jointOffset("station",station.diameter/20,(station.diameter/2)-(station.diameter/20)),
      jointOffset("station",-station.diameter/20,(station.diameter/2)-(station.diameter/20))
    )
    noStroke()
    pointsRectangle(
      jointOffset("station",-station.diameter/20,0),
      jointOffset("station",station.diameter/20,0),
      jointOffset("station",station.diameter/20,-(station.diameter/2)+(station.diameter/20)),
      jointOffset("station",-station.diameter/20,-(station.diameter/2)+(station.diameter/20))
    )
    noStroke()
    pointsRectangle(
      jointOffset("station",0,-station.diameter/20),
      jointOffset("station",0,station.diameter/20),
      jointOffset("station",(station.diameter/2)-(station.diameter/20),station.diameter/20),
      jointOffset("station",(station.diameter/2)-(station.diameter/20),-station.diameter/20)
    )
    noStroke()
    pointsRectangle(
      jointOffset("station",0,-station.diameter/20),
      jointOffset("station",0,station.diameter/20),
      jointOffset("station",-(station.diameter/2)+(station.diameter/20),station.diameter/20),
      jointOffset("station",-(station.diameter/2)+(station.diameter/20),-station.diameter/20)
    )
    
    let angle;
    for (let i = 0; i < joints.length; i++) {
      if (joints[i][0] == "station") {
        angle = joints[i][1];
      }
    }
    
    let arcGapIn = 50
    let arcGapOut = 35
    
    let arcRadIn = station.diameter/4
    let arcRadOut = station.diameter-(station.diameter/20)
    
    stroke(station.lightColor)
    noFill()
    
    strokeWeight(2)
    strokeCap(PROJECT)
    arc(0,0,arcRadIn,arcRadIn, angle + 0 + (arcGapIn/2), angle + 0 + 90 - (arcGapIn/2))
    arc(0,0,arcRadIn,arcRadIn, angle + 90 + (arcGapIn/2), angle + 90 + 90 - (arcGapIn/2))
    arc(0,0,arcRadIn,arcRadIn, angle + 180 + (arcGapIn/2), angle + 180 + 90 - (arcGapIn/2))
    arc(0,0,arcRadIn,arcRadIn, angle + 270 + (arcGapIn/2), angle + 270 + 90 - (arcGapIn/2))
    
    strokeWeight(2.5)
    arc(0,0,arcRadOut,arcRadOut, angle + 0 + (arcGapOut/2), angle + 0 + 90 - (arcGapOut/2))
    arc(0,0,arcRadOut,arcRadOut, angle + 90 + (arcGapOut/2), angle + 90 + 90 - (arcGapOut/2))
    arc(0,0,arcRadOut,arcRadOut, angle + 180 + (arcGapOut/2), angle + 180 + 90 - (arcGapOut/2))
    arc(0,0,arcRadOut,arcRadOut, angle + 270 + (arcGapOut/2), angle + 270 + 90 - (arcGapOut/2))
    
  }
}


let rand;
let su = false;
let Fcount = 0;
let JbuttonEnabled = false;
let JbuttonHover = false;
let SbuttonEnabled = true;
let buttons = []; // first value in each table is the enabled value, 2nd is the button's name (NAMES SHOULD BE DIFFERENT)

let buttonsLoaded = false;

// button functions
function newButton(
  name,
  displayText,
  textsize,
  X,
  Y,
  W,
  H,
  Col1,
  Col2,
  ColP1,
  ColP2,
  bWidth,
  func,
  alx,
  aly,
  pad
) {
  // Col inputs should be arrays or color()s
  buttons[buttons.length] = [];
  buttons[buttons.length - 1][0] = false;
  buttons[buttons.length - 1][1] = name;
  buttons[buttons.length - 1][2] = displayText ?? "";
  buttons[buttons.length - 1][3] = textsize ?? 10;
  buttons[buttons.length - 1][4] = X ?? 50;
  buttons[buttons.length - 1][5] = Y ?? 50;
  buttons[buttons.length - 1][6] = W ?? 50;
  buttons[buttons.length - 1][7] = H ?? 50;
  buttons[buttons.length - 1][8] = Col1 ?? color(255);
  buttons[buttons.length - 1][9] = Col2 ?? color(0);
  buttons[buttons.length - 1][10] = ColP1 ?? color(255);
  buttons[buttons.length - 1][11] = ColP2 ?? color(0);
  buttons[buttons.length - 1][12] = bWidth ?? 1;
  buttons[buttons.length - 1][13] = func ?? function () {};
  buttons[buttons.length - 1][14] = alx ?? CENTER;
  buttons[buttons.length - 1][15] = aly ?? CENTER;
  buttons[buttons.length - 1][16] = pad ?? 0;
}

function removeButton(name) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      for (let a = i; a < buttons.length; a++) {
        buttons[a] = buttons[a + 1];
      }
      buttons.length = buttons.length - 1;
      break;
    }
  }
}

function setButtonAlign(name, alx, aly) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][14] = aly;
      buttons[i][15] = alx;
    }
  }
}

function toggleButton(name) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][0] = !buttons[i][0];
    }
  }
}

function setButtonEnabled(name, value) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][0] = value;
    }
  }
}

function setButtonPos(name, X, Y) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][4] = X;
      buttons[i][5] = Y;
    }
  }
}

function setButtonSize(name, W, H) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][6] = W;
      buttons[i][7] = H;
    }
  }
}

function setButtonColors(name, Col1, Col2, ColP1, ColP2) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][8] = Col1;
      buttons[i][9] = Col2;
      buttons[i][10] = ColP1;
      buttons[i][11] = ColP2;
    }
  }
}

function setButtonText(name, Text, Size) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][2] = Text;
      buttons[i][3] = Size ?? buttons[i][3];
    }
  }
}

function setButtonBorder(name, b) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][12] = b;
    }
  }
}

function setButtonPadding(name, p) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][16] = p;
    }
  }
}

function setButtonFunction(name, func) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][13] = func;
    }
  }
}

function runButton(name) {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][1] == name) {
      buttons[i][13]();
    }
  }
}

function clearButtons() {
  buttons = [];
}

// SETUP
// INITIAL SETUP AND UNIVERSE GENERATION
function setup() {
  createCanvas(windowWidth, windowHeight);
  randomSeed(seed);
  noiseSeed(seed);
  
  camera.zoom = 5
  
  
  
  playerShip = new Sprite(0,0,8,6);
  playerShip.mass = 0.7
  playerShip.rotationDrag = 5
  playerShip.drag = 5
  playerShip.color = color(10,10,15)
  playerShip.stroke = color(0,0,255)
  playerShip.strokeWeight = 0.3
  playerShip.maxIntegrity = 100;
  playerShip.integrity = 100;
  
  function resetPlayer(){
    playerShip.x = 0
    playerShip.y = 0
    playerShip.rotationSpeed = 0
    playerShip.speed = 0
    camera.x = playerShip.x
    camera.y = playerShip.y
  }
  
  camera.x = playerShip.x
  camera.y = playerShip.y

  // generate star positions
  for (let i = 1; i <= Scount; i++) {
    while (!su) {
      m[i * 2 - 2] = random(1, 500);
      m[i * 2 - 1] = random(1, 500);

      if (noise(m[i * 2 - 2] / 500, m[i * 2 - 1] / 500) > nThresh) {
        su = true;
      } else {
        Fcount++;
      }

      if (Fcount > 1000) {
        // prevents the program from crashing if the loop cannot end due to bad noise
        print("failed to generate map!");
        break;
      }
    }

    su = false;
    if (Fcount > 1000) {
      break;
    }
  }

  // generate star names
  for (let i = 0; i <= Scount; i++) {
    inf[i] = "";

    for (let c = 0; c < ceil(random(3)); c++) {
      inf[i] = inf[i] + char(floor(random(65, 65 + 26)));
    }

    inf[i] = inf[i] + "-" + floor(random(1, 100));
  }

  // set star class
  for (let i = 0; i <= Scount; i++) {
    cl[i] = random(classes);
  }

  // generate solar systems
  // sys[star][planet][0 = type, 1 = orbit, 2 = size, 3 = speed , 4 = color, 5 = name]
  for (let i = 0; i <= Scount; i++) {
    su = false;

    sys[i] = [];
    let P;

    switch (cl[i]) {
      case "Red M-Class":
        P = round(random(1, 6));
        break;
      case "Yellow M-Class":
        P = round(random(2, 7));
        break;
      case "Blue M-Class":
        P = round(random(3, 8));
        break;
      case "Red Giant":
        P = round(random(0, 3));
        break;
      case "Neutron Star":
        P = round(random(0, 2));
        break;
      case "White Dwarf":
        P = round(random(0, 2));
        break;
    }

    for (let p = 0; p < P; p++) {
      su = false;
      sys[i][p] = [];
      while (!su) {
        rand = random();

        if (
          rand <= 0.05 &&
          cl[i] != "Neutron Star" &&
          cl[i] != "Red Giant" &&
          cl[i] != "White Dwarf"
        ) {
          sys[i][p][0] = "Earthlike";
          sys[i][p][1] = round(random(105, 145)) + 0.5;
          sys[i][p][2] = round(random(8, 12));
          sys[i][p][3] = random(-0.15, 0.015);
          sys[i][p][4] = color(
            random(0, 20),
            random(200, 240),
            random(50, 200)
          );
          su = true;
        } else if (
          rand > 0.05 &&
          rand <= 0.15 &&
          cl[i] != "Neutron Star" &&
          cl[i] != "Red Giant"
        ) {
          sys[i][p][0] = "Water World";
          sys[i][p][1] = round(random(100, 150)) + 0.5;
          sys[i][p][2] = round(random(8, 14));
          sys[i][p][3] = random(-0.15, 0.015);
          sys[i][p][4] = color(random(0, 20), random(20, 100), random(50, 200));
          su = true;
        } else if (rand > 0.15 && rand <= 0.35) {
          sys[i][p][0] = "Rocky";
          sys[i][p][1] = round(random(25, 175)) + 0.5;
          sys[i][p][2] = round(random(5, 15));
          sys[i][p][3] = random(-0.05, 0.05);
          sys[i][p][4] = color(random(20, 180), random(0, 120), random(0, 100));
          su = true;
        } else if (rand > 0.35 && rand <= 0.65) {
          sys[i][p][0] = "Gas Giant";
          sys[i][p][1] = round(random(125, 225)) + 0.5;
          sys[i][p][2] = round(random(15, 25));
          sys[i][p][3] = random(-0.2, 0.2);
          sys[i][p][4] = color(
            random(40, 210),
            random(30, 140),
            random(0, 100)
          );
          su = true;
        } else if (rand > 0.65 && rand <= 1) {
          rand = random(30);
          sys[i][p][0] = "Asteroid Belt";
          sys[i][p][1] = round(random(25, 225)) + 0.5;
          sys[i][p][2] = round(random(5, 20));
          sys[i][p][3] = random(-0.2, 0.2);
          sys[i][p][4] = color(
            16 + rand + random(10),
            5 + rand + random(10),
            rand + random(10)
          );
          su = true;
        }
      }
      switch (sys[i][p][0]) {
        case "Asteroid Belt":
          sys[i][p][5] = "AB-";
          break;
        case "Earthlike":
          sys[i][p][5] = "EL-";
          break;
        case "Water World":
          sys[i][p][5] = "WW-";
          break;
        case "Rocky":
          sys[i][p][5] = "RY-";
          break;
        case "Gas Giant":
          sys[i][p][5] = "GG-";
      }
      for (let c = 0; c < ceil(random(2, 4)); c++) {
        rand = random();
        if (rand < 0.5) {
          sys[i][p][5] = sys[i][p][5] + char(floor(random(65, 65 + 26)));
        } else {
          sys[i][p][5] = sys[i][p][5] + round(random(9));
        }
      }
      sys[i][p][5] = sys[i][p][5] + "-";
    }
    let dists = [];
    for (let p = 0; p < P; p++) {
      dists[p] = sys[i][p][1];
    }
    sort(dists);
    for (let p = 0; p < P; p++) {
      for (let d = 0; d < dists.length; d++) {
        if (sys[i][p][1] == dists[d]) {
          sys[i][p][5] = sys[i][p][5] + (d + 1);
        }
      }
    }
  }

  // generate stations
  // stations[star][station][0 = type, 1 = orbit, 2 = speed, 3 = name, 4 = data[0 = name,1 = demand, 2 = stock, 3 = price offset,4 = buying/selling/both]]
  for (let i = 0; i <= Scount; i++) {
    stations[i] = [];
    let randn = round(random(2));
    for (let s = 0; s < randn; s++) {
      stations[i][s] = [];
      stations[i][s][0] = random(industries);
      stations[i][s][1] = round(random(70, 240));
      stations[i][s][2] =
        (0.5 * (round(random()) * 2 - 1)) / (stations[i][s][1] * 0.2);

      stations[i][s][3] = "";
      // generate name
      rand = round(random(4, 8));
      let vowl = [];
      for (let v = 0; v < random(3); v++) {
        vowl[v] = [];
        vowl[v][1] = random(["a", "e", "i", "o", "u"]);
        vowl[v][2] = round(random(rand));
      }
      for (let n = 0; n < rand; n++) {
        let vowel = false;
        for (let v = 0; v < vowl.length; v++) {
          if (vowl[v][2] == n) {
            stations[i][s][3] = stations[i][s][3] + vowl[v][1];
            vowel = true;
          }
        }
        if (!vowel) {
          stations[i][s][3] =
            stations[i][s][3] + char(floor(random(97, 97 + 26)));
        }
      }

      // generate data
      stations[i][s][4] = [];
      for (let c = 0; c < commod.length; c++) {
        let canhave = false;
        let buys = false;
        let sells = false;
        for (let b = 0; b < commod[c][2].length; b++) {
          if (
            commod[c][2][b] == stations[i][s][0] ||
            commod[c][2][b] == "anywhere"
          ) {
            canhave = true;
            buys = true;
          }
        }
        for (let b = 0; b < commod[c][3].length; b++) {
          if (
            commod[c][3][b] == stations[i][s][0] ||
            commod[c][3][b] == "anywhere"
          ) {
            canhave = true;
            sells = true;
          }
        }
        if (canhave) {
          stations[i][s][4][stations[i][s][4].length] = [];
          stations[i][s][4][stations[i][s][4].length - 1][0] = commod[c][0];
          if (buys && sells) {
            stations[i][s][4][stations[i][s][4].length - 1][1] = round(
              random(100 / commod[c][4], 200 / commod[c][4])
            );
          } else if (buys) {
            stations[i][s][4][stations[i][s][4].length - 1][1] = round(
              random(100 / commod[c][4], 300 / commod[c][4])
            );
          } else if (sells) {
            stations[i][s][4][stations[i][s][4].length - 1][1] = round(
              random(200 / commod[c][4], 400 / commod[c][4])
            );
          }
          stations[i][s][4][stations[i][s][4].length - 1][2] = round(
            random(stations[i][s][4][stations[i][s][4].length - 1][1])
          );

          if (sells) {
            stations[i][s][4][stations[i][s][4].length - 1][3] = round(
              random(-commod[c][1] * 0.2, 0),
              2
            );
          } else {
            stations[i][s][4][stations[i][s][4].length - 1][3] = round(
              random(-commod[c][1] * 0.1, commod[c][1] * 0.1),
              2
            );
          }

          if (buys && !sells) {
            stations[i][s][4][stations[i][s][4].length - 1][4] = 1;
          } else if (sells && !buys) {
            stations[i][s][4][stations[i][s][4].length - 1][4] = 2;
          } else if (buys && sells) {
            stations[i][s][4][stations[i][s][4].length - 1][4] = 3;
          }
        }
      }
    }
  }

  // initialize cargo
  for (let i = 0; i < cargoSlots; i++) {
    cargo[i] = ["EMPTY"];
  }
}

// give the star system index and the station index and the commodity name and return the station's commodity data
// I'm sick of having to keep writing the code to find station data some I'm finally putting it in a function like a somewhat sane person
function findCommodity(starSystem, station, commodity) {
  for (let i = 0; i < stations[starSystem][station][4].length; i++) {
    if (stations[starSystem][station][4][i][0] == commodity)
      return stations[starSystem][station][4][i];
  }
}

// cargo functions

// returns a table of [0 = resulting cargo, 1 = success, 2 = items added]
function addCargo(commodityName, count) {
  let spaceAvailable = false;
  let availableRoom = 0;
  let item;
  for (let i = 0; i < commod.length; i++) {
    if (commod[i][0] == commodityName) {
      item = commod[i];
    }
  }

  // error handling
  if (commodityName == "EMPTY") {
    print('DONT TRY TO ADD "EMPTY" YOU IDIOT!');
    return [cargo, false, 0];
  }
  if (item == null) {
    print("no matching item!");
    return [cargo, false, 0];
  }
  if (count < 0) {
    print("USE removeCargo TO REMOVE CARGO, NOT addCargo!");
    return [cargo, false, 0];
  }

  // check whether there is room available and how much more of the item it can hold
  for (let i = 0; i < cargo.length; i++) {
    if (cargo[i][0] == "EMPTY") {
      spaceAvailable = true;
      availableRoom += floor(maxStack / item[4]);
    }

    if (cargo[i][0] == item[0] && cargo[i][1] <= floor(maxStack / item[4])) {
      spaceAvailable = true;
      availableRoom += floor(maxStack / item[4]) - cargo[i][1];
    }
  }

  // return the original cargo and failed if there is no room
  if (!spaceAvailable) return [cargo, false, 0];

  let newCargo = JSON.parse(JSON.stringify(cargo));
  let cargoToAdd;
  if (availableRoom >= count) {
    cargoToAdd = count;
  } else {
    cargoToAdd = availableRoom;
  }
  let addedCargo = cargoToAdd;

  for (let i = 0; i < newCargo.length; i++) {
    if (newCargo[i][0] == "EMPTY") {
      if (cargoToAdd >= floor(maxStack / item[4])) {
        newCargo[i][0] = item[0];
        newCargo[i][1] = floor(maxStack / item[4]);
        cargoToAdd -= floor(maxStack / item[4]);
      } else if (cargoToAdd > 0) {
        newCargo[i][0] = item[0];
        newCargo[i][1] = cargoToAdd;
        cargoToAdd = 0;
      }
    }

    if (newCargo[i][0] == item[0]) {
      if (cargoToAdd >= floor(maxStack / item[4]) - newCargo[i][1]) {
        newCargo[i][0] = item[0];
        cargoToAdd -= floor(maxStack / item[4]) - newCargo[i][1];
        newCargo[i][1] = floor(maxStack / item[4]);
      } else if (cargoToAdd > 0) {
        newCargo[i][0] = item[0];
        newCargo[i][1] += cargoToAdd;
        cargoToAdd = 0;
      }
    }
  }

  return [newCargo, true, addedCargo];
}

// returns a table of [0 = resulting cargo, 1 = success, 2 = items removed]
function removeCargo(commodityName, count) {
  let cargoToRemove = count;
  let removedCargo = 0;
  let newCargo = JSON.parse(JSON.stringify(cargo));

  let cargoFound = false;
  for (let i = 0; i < newCargo.length; i++) {
    if (newCargo[i][0] == commodityName) cargoFound = true;
  }

  // error handling
  if (commodityName == "EMPTY") {
    print('DONT TRY TO REMOVE "EMPTY" YOU IDIOT!');
    return [cargo, false, 0];
  }
  if (!cargoFound) {
    return [cargo, false, 0];
  }
  if (count < 0) {
    print("USE addCargo TO ADD CARGO, NOT removeCargo!");
    return [cargo, false, 0];
  }

  for (let i = newCargo.length - 1; i >= 0; i--) {
    if (newCargo[i][0] == commodityName) {
      if (cargoToRemove >= newCargo[i][1]) {
        cargoToRemove -= newCargo[i][1];
        removedCargo += newCargo[i][1];
        newCargo[i][1] = 0;
      } else {
        newCargo[i][1] -= cargoToRemove;
        removedCargo += cargoToRemove;
        cargoToRemove = 0;
      }

      if (newCargo[i][1] == 0) {
        newCargo[i] = ["EMPTY"];
      }
    }
  }

  return [newCargo, true, removedCargo];
}

// returns the resulting cargo array
function clearStack(stackIndex) {
  let newCargo = cargo;
  if (stackIndex >= cargo.length) return cargo;
  newCargo[stackIndex] = ["EMPTY"];
  return newCargo;
}

// returns how much of the entered item you have, or how many stacks of EMPTY you have
function getCargo(commodityName) {
  let itemCount = 0;
  for (let i = 0; i < cargo.length; i++) {
    if (cargo[i][0] == commodityName) {
      if (commodityName == "EMPTY") {
        itemCount++;
      } else {
        itemCount += cargo[i][1];
      }
    }
  }
  return itemCount;
}

// returns an array of [*cargo size [0 = % full, 1 = commod color]]
function displayCargo(Cargo) {
  let cargoDisplay = [];
  for (let i = 0; i < Cargo.length; i++) {
    cargoDisplay[i] = [];
    if (Cargo[i][0] == "EMPTY") {
      cargoDisplay[i][0] = 0;
      cargoDisplay[i][1] = color(0, 0, 255);
    } else {
      let com = getCommodity(Cargo[i][0]);
      cargoDisplay[i][0] = (Cargo[i][1] * com[4]) / maxStack;
      cargoDisplay[i][1] = com[5];
    }
  }
  return cargoDisplay;
}

// gets the total price of a trade by getting the price for each single item to get the most precise price
// BS: true = buying, false = selling
// REQUIRES THE STATION COMMODITY DATA, NOT THE NAME
function tradePrice(BS, staComm, amount) {
  let cost = 0;
  let com;
  for (let c = 0; c < commod.length; c++) {
    if (commod[c][0] == staComm[0]) {
      com = commod[c];
    }
  }
  if (BS) {
    for (let i = 0; i < amount; i++) {
      let price;
      var demandMult = (staComm[2] - i) / staComm[1];
      if (demandMult > 1.25) demandMult = 1.25;
      if (demandMult < 0.75) demandMult = 0.75;
      price = com[1] * demandMult + staComm[3];
      cost += round(price, 2);
    }
  } else {
    for (let i = 0; i < amount; i++) {
      let price;
      var demandMult = (staComm[2] + i) / staComm[1];
      if (demandMult > 1.25) demandMult = 1.25;
      if (demandMult < 0.75) demandMult = 0.75;
      price = com[1] * demandMult + staComm[3];
      cost += round(price, 2);
    }
  }
  return cost;
}

var dis = 0;
var Bdis = 1000;
var cS = "null";
var cP = "null";
var cSt = "null";
var ast = false;
var dtCount = 0;
var Psta = "null";
var TS = 0;
var sComm = "null";
var Tmult = 1;
var buysell = 0;
var cart = 0;

let timers = [];

function newTimer(name) {
  timers[timers.length] = [];
  timers[timers.length - 1][0] = name;
  timers[timers.length - 1][1] = dtCount;
  timers[timers.length - 1][2] = false;
}

function getTimer(name) {
  for (let i = 0; i < timers.length; i++) {
    if (timers[i][0] == name) {
      return dtCount - timers[i][1];
    }
  }
}

function resetTimer(name) {
  for (let i = 0; i < timers.length; i++) {
    if (timers[i][0] == name) {
      timers[i][1] = dtCount;
    }
  }
}

function removeTimer(name) {
  for (let i = 0; i < timers.length; i++) {
    if (timers[i][0] == name) {
      for (let a = i; a < timers.length; a++) {
        timers[a] = timers[a + 1];
      }
      timers.length = timers.length - 1;
      break;
    }
  }
}

function setTimerPaused(name, paused) {
  for (let i = 0; i < timers.length; i++) {
    if (timers[i][0] == name) {
      timers[i][2] = paused;
    }
  }
}

newTimer("Jump Timer");
  
var pressed = false;
  
var jumping = false;
var jumpBegin = false;
var destination = "none"
// string "S-#[-S-# or -P-#]"
// the first S-# is the index of the star
// after the first S-# can be another - followed by S-# or P-#
// if the second part is S-# it indicates a station and a station index
// if the second part is P-# it indicates a celestial body (planet, asteroid belt, etc.) and an index
// EX: "S-32-S-1" would attempt to jump to the first station at star 32

function hyperjump(target){
  if(!jumping){
    jumping = true;
    jumpBegin = true;
    destination = target;
  }
}
  
function loadScene(target){
  // remove everything and reset the player
  let rot = playerShip.rotation
  docked = false
  
  allSprites.removeAll();
  
  playerShip = new Sprite(0,0,8,6);
  playerShip.mass = 0.7
  playerShip.rotationDrag = 5
  playerShip.drag = 5
  playerShip.color = color(10,10,15)
  playerShip.stroke = color(0,0,255)
  playerShip.strokeWeight = 3
  playerShip.maxIntegrity = 100;
  playerShip.integrity = 100;
  
  playerShip.x = 0
  playerShip.y = 0
  playerShip.rotation = rot
  playerShip.rotationSpeed = 0
  playerShip.speed = 0
  camera.x = playerShip.x
  camera.y = playerShip.y
  
  // get the star index
  let star = + target.split("-")[1]
  Pstar = star
  Pstation = "null";
  
  if(target.includes("-S-")){
    
    // extracts the station index from the string using dark magic
    let sta = + target.split("-")[3]
    Pstation = sta
    
    let Scol;
    switch (stations[Pstar][Pstation][0]){
        case "Mining":
          Scol = color(240, 160, 0);
          break;
        case "Refining":
          Scol = color(240, 200, 0);
          break;
        case "Technology":
          Scol = color(0, 50, 230);
          break;
        case "Organics":
          Scol = color(0, 255, 20);
          break;
        case "Manufacturing":
          Scol = color(120, 20, 0);
          break;
    }
    createStation(color(Scol))
  }
}
  
// auto resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// button and mouse input handling
function mouseReleased() {
  pressed = false;

  for (let i = 0; i < buttons.length; i++) {
    if (
      buttons[i][0] &&
      mouseX > buttons[i][4] &&
      mouseX < buttons[i][4] + buttons[i][6] &&
      mouseY > buttons[i][5] &&
      mouseY < buttons[i][5] + buttons[i][7] &&
      !pressed
    ) {
      buttons[i][13]();
      pressed = true;
    }
  }
}

var timersCreated = false;

function draw() {
  background(10, 10, 15);
  
  if(!paused){
    dtCount = dtCount + floor(deltaTime) / 1000;
    dtCount = dtCount - (dtCount % 0.001); // attempts to to remove floating point inaccuracies
    world.autoStep = true
  } else {
    world.autoStep = false
  }
  
  if(DTlog.push(floor(deltaTime) / 1000) >= 10){
    DTlog.splice(0,1)
  }
  
  // pausing control
  if(kb.pressed("escape") && screen == "NONE") {
    paused = true // only toggle pausing if the player is not in a menu or in the pause menu
    buttonsLoaded = false
  } else if (kb.pressed("escape")) { // if escape is pressed in a menu then close the menu instead of pausing
    screen = "NONE"
    paused = false
    clearButtons()
    buttonsLoaded = false
  }
  if(paused) screen = "PAUSE"
  
  // background
  stroke(255)
  strokeWeight(2)
  for (let i = 1; i <= m.length / 2; i++) {
      switch (cl[i]) {
        case "Red M-Class":
          stroke(255, 235, 235);
          break;

        case "Yellow M-Class":
          stroke(255, 255, 230);
          break;

        case "Blue M-Class":
          stroke(220, 225, 255);
          break;

        case "Red Giant":
          stroke(255, 210, 210);
          break;
      }
      point(5*(m[i * 2 - 2]-m[Pstar * 2 - 2]) + (windowWidth/2), 5*(m[i * 2 - 1]-m[Pstar * 2 - 1]) + (windowHeight/2));
    }
  noStroke()
  fill(10,10,15)
  rect(windowWidth/2 - 3, windowHeight/2 - 3, windowWidth/2 + 3, windowHeight/2 + 3)
  
  // smooth-ish camera follow
  camera.x = playerShip.x - (playerShip.vel.x/abs(playerShip.vel.x))*(sqrt(abs(playerShip.vel.x))*0.3)
  camera.y = playerShip.y - (playerShip.vel.y/abs(playerShip.vel.y))*(sqrt(abs(playerShip.vel.y))*0.3)
  
  playerShip.bearing = playerShip.rotation - 90;
  if(kb.pressing("up")) playerShip.applyForce(speed)
  if(kb.pressing("down")) playerShip.applyForce(-speed/2)
  if(kb.pressing("right")) playerShip.applyTorque(turn)
  if(kb.pressing("left")) playerShip.applyTorque(-turn)
  
  if(kb.pressing("up")&&kb.pressing("left")&&kb.pressing("right")){
    playerShip.drag = 0.2
    playerShip.rotationDrag = 0.2
  } else {
    playerShip.drag = 0.5
    playerShip.rotationDrag = 0.5
  }
  
  playerShip.draw = () => {
    
    fill(200,100,0)
    noStroke()
    
    if(kb.pressing("up") && !docked){
      triangle(2,3,-2,3,0,sin(dtCount*360*8)*1+3.8)
    }
    if(kb.pressing("left") && !docked){
      triangle(2.5,2.8,4,0.5,cos(40)*(sin(dtCount*360*8)*2)+3.3,sin(40)*(sin(dtCount*360*8)*2)+1.7)
    }
    if(kb.pressing("right") && !docked){
      triangle(-2.5,2.8,-4,0.5,cos(140)*(sin(dtCount*360*8)*2)-3.3,sin(140)*(sin(dtCount*360*8)*2)+1.7)
    }
    
    stroke(0,50,240)
    strokeWeight(0.3)
    fill(10,10,15)
    
    triangle(0,0.5,2,3,-2,3)
    triangle(-0.5,0.5,-2.5,2.8,-4,0.5)
    triangle(0.5,0.5,2.5,2.8,4,0.5)
    
    noStroke()
    triangle(0,0,2,-3,-2,-3)
    triangle(0,0,4,0,2,-3)
    triangle(0,0,-4,0,-2,-3)
    
    stroke(0,50,240)
    line(-4,0,4,0)
    line(4,0,2,-3)
    line(2,-3,-2,-3)
    line(-4,0,-2,-3)
    
  }
  
  if(kb.pressed("j") && destination != "none"){
    hyperjump(destination)
  }
  
  // code for hyper-jump sequence
  if(jumping){
    
    if(jumpBegin){
      
      resetTimer("Jump Timer");
      
      // prevents the player from moving
      speed = 0;
      turn = 0;
      docked = true;
      
      jumpBegin = false
      
    }
    
    let Jtimer = getTimer("Jump Timer")
    
    let ring1rad = 75;
    let ring1speed = 270;
    let ring1sides = 12
    
    let ring1TRad;
    
    if(Jtimer <= 1){
      ring1TRad = ring1rad * sin(Jtimer*90);
    } else {
      ring1TRad = ring1rad;
    }
    
    let ring1rot = Jtimer * ring1speed;
    
    for(let i = 0; i < ring1sides; i++){
      strokeWeight(2)
      stroke(0,0,255)
      line( (windowWidth/2) + ring1TRad * cos(ring1rot + (360/ring1sides)*i),
           (windowHeight/2) + ring1TRad * sin(ring1rot + (360/ring1sides)*i),
          (windowWidth/2) + ring1TRad * cos(ring1rot + (360/ring1sides)*(i+1)),
           (windowHeight/2) + ring1TRad * sin(ring1rot + (360/ring1sides)*(i+1)))
    }
    
    strokeWeight(1)
    
    if(Jtimer >= 3){
      speed = 0.5
      turn = 0.0005
      loadScene(destination)
      destination = "none"
      jumping = false
    }
    
  }
  
  
  // SPRITES AND PHYSICS GO ABOVE
  
  camera.on()
  allSprites.draw()
  camera.off()
  
  // UI AND MENUS GO BELOW
  
  if(destination != "none" && !jumping){
    textAlign(CENTER,CENTER)
      textSize(20)
      fill(color(255,255,255,100))
      noStroke()
      text("press j to hyperjump",windowWidth/2,windowHeight/2 + 120)
  }
  
  // arrow pointing to station
  if(Pstation != "null"){
    
    if(station.removed){
      
      textAlign(CENTER,CENTER)
      textSize(20)
      fill(color(255,0,0,255))
      noStroke()
      text("docking aborted, re-jump to re-dock",windowWidth/2,windowHeight/2 + 100)
      
    } else {

      x = playerShip.x - station.x
      y = playerShip.y - station.y

      angle = atan(y/x)
      if(x > 0) angle = angle + 180

      noFill()
      stroke(200)
      strokeWeight(1.5)
      triangle(windowWidth/2 + cos(angle+5)*50,windowHeight/2 + sin(angle+5)*50,windowWidth/2 + cos(angle-5)*50,windowHeight/2 + sin(angle-5)*50,windowWidth/2 + cos(angle)*75,windowHeight/2 + sin(angle)*75)
      
      textAlign(CENTER,CENTER)
      textSize(15)
      fill(color(255,255,255,255))
      noStroke()
      text((round((sqrt(x*x+y*y)-station.diameter/2)/1))+" m", windowWidth/2 + cos(angle)*110,windowHeight/2 + sin(angle)*110)

      updateStation();

      if(docked){
        /*textAlign(CENTER,CENTER)
        textSize(20)
        fill(color(255,255,255,100))
        noStroke()
        text("press e to undock",350,350)*/
      } else if(canDock){
        textAlign(CENTER,CENTER)
        textSize(20)
        fill(color(255,255,255,100))
        noStroke()
        text("press e to dock",windowWidth/2,windowHeight/2 + 100)
      }
      canDock = false;
    }
  }
  
  if(kb.pressed("m") && (screen != "STARS" && screen != "SYSTEM" && screen != "STATION")){
    screen = "SYSTEM"
    buttonsLoaded = false;
  } else if(kb.pressed("m") && (screen == "STARS" || screen == "SYSTEM")){
    screen = "NONE"
    clearButtons()
    buttonsLoaded = false;
  }
  
  textSize(14);
  textAlign(LEFT, TOP);
  cursor(ARROW);

  // pause timers
  for (let i = 0; i < timers.length; i++) {
    if (timers[i][2]) {
      timers[i][1] =
        timers[i][1] + floor(deltaTime) / 1000 - (timers[i][1] % 0.001);
    }
  }

  // create main timers once
  if (!timersCreated) {
    newTimer("Restock");

    timersCreated = true;
  }

  // add items and process items every 20 seconds
  if (getTimer("Restock") >= 20) {
    for (let ss = 0; ss < stations.length; ss++) {
      for (let s = 0; s < stations[ss].length; s++) {
        switch (stations[ss][s][0]) {
          case "Mining":
            let stock = [];
            // table of commidities that can be restocked

            for (let c = 0; c < commod.length; c++) {
              for (let e = 0; e < commod[c][3].length; e++) {
                if (commod[c][3][e] == "Mining")
                  stock[stock.length] = commod[c][0];
              }
            }
            // gets the possible commodities to restock

            let toRestock = 5;
            for (let i = 0; i < toRestock; i++) {
              let toAdd = random(stock);
              for (let it = 0; it < stations[ss][s][4].length; it++) {
                if (
                  stations[ss][s][4][it][0] == toAdd &&
                  stations[ss][s][4][it][2] < stations[ss][s][4][it][1]
                )
                  stations[ss][s][4][it][2]++;
              }
            }
            // restocks toRestock possible commodities to the station

            break;

          case "Refining":
            // get the commodities that can be smelted
            let smeltable = [];
            for (let i = 0; i < smeltables.length; i++) {
              smeltable[smeltable.length] = smeltables[i][1];
            }

            // smelt [NUMBER] smeltable commodites and exchange them for their smelted form
            let toSmelted = 5;
            for (let i = 0; i < toSmelted; i++) {
              let toSmelt = round(random(0, smeltable.length - 1));
              if (
                findCommodity(ss, s, smeltable[toSmelt])[2] >=
                  smeltables[toSmelt][0] &&
                findCommodity(ss, s, smeltables[toSmelt][3])[1] -
                  findCommodity(ss, s, smeltables[toSmelt][3])[2] >=
                  smeltables[toSmelt][2]
              ) {
                // checks if there is enough to smelt and if there is enough room for the output
                findCommodity(ss, s, smeltable[toSmelt])[2] -=
                  smeltables[toSmelt][0];
                findCommodity(ss, s, smeltables[toSmelt][3])[2] +=
                  smeltables[toSmelt][2];
              }
            }

            break;
        }
      }
    }

    //DEBUG, DELETE ONCE FINISHED
    print(stations);

    resetTimer("Restock");
  }
  
  if(FPScounter){
    textSize(12)
    noStroke()
    fill(255)
    let FPS = 0;
    for(let i = 0; i < DTlog.length; i++){
      FPS += DTlog[i]
    }
    FPS /= DTlog.length
    FPS = 1/FPS
    FPS = round(FPS, 1)
    text("FPS: "+FPS,10,10)
  }

  textSize(13.5);
  textAlign(LEFT, TOP);
  
  if(jumping){
    
    
    
  }

  if (screen == "STARS") {
    
    let xOffset = round((windowWidth/2)-350)
    let yOffset = round((windowHeight/2)-250)
    
    stroke(themePrimary)
    strokeWeight(2)
    noStroke()
    fill(10,10,15)
    rect(xOffset,yOffset,700,500)
    
    if (!buttonsLoaded) {
      clearButtons();
      // newButton(name,displayText,textsize,X,Y,W,H,Col1,Col2,ColP1,ColP2,bWidth,func,alx,aly)

      newButton(
        "Jump Button",
        "set destination",
        20,
        xOffset+520,
        yOffset+440,
        160,
        40,
        themeSecondary,
        themeSecondaryDark,
        themeSecondary,
        themeSecondaryDark,
        3,
        function () {
          screen = "NONE"
          clearButtons();
          buttonsLoaded = false;
          destination = "S-"+cS
        },
        CENTER,
        CENTER
      );
      newButton(
        "System Button",
        "system map",
        20,
        xOffset+520,
        yOffset+440,
        160,
        40,
        themeTertiary,
        themeTertiaryDark,
        themeTertiary,
        themeTertiaryDark,
        3,
        function () {
          screen = "SYSTEM";
          buttonsLoaded = false;
        },
        CENTER,
        CENTER
      );

      buttonsLoaded = true;
    }

    if (mouseX < 500 + xOffset && mouseY < 500 + yOffset && mouseX > xOffset && mouseY > yOffset) {
      noCursor();
    }

    strokeWeight(1);

    stroke(themeTertiary);

    line(
      min(max(mouseX + 0.5,xOffset), 500 + xOffset),
      yOffset,
      min(max(mouseX + 0.5,xOffset), 500 + xOffset),
      min(max(mouseY - 20,yOffset), 500 + yOffset)
    );
    line(
      min(max(mouseX + 0.5,xOffset), 500 + xOffset),
      500 + yOffset,
      min(max(mouseX + 0.5,xOffset), 500 + xOffset),
      min(max(mouseY + 20,yOffset), 500 + yOffset)
    );

    stroke(themeSecondary);

    line(
      xOffset,
      min(max(mouseY + 0.5, yOffset), 500 + yOffset),
      min(max(mouseX - 20, xOffset), 500 + xOffset),
      min(max(mouseY + 0.5, yOffset), 500 + yOffset)
    );
    line(
      500 + xOffset,
      min(max(mouseY + 0.5, yOffset), 500 + yOffset),
      min(max(mouseX + 20, xOffset), 500 + xOffset),
      min(max(mouseY + 0.5, yOffset), 500 + yOffset)
    );

    strokeWeight(2);
    stroke(255);

    // draw stars
    for (let i = 1; i <= m.length / 2; i++) {
      switch (cl[i]) {
        case "Red M-Class":
          stroke(255, 235, 235);
          break;

        case "Yellow M-Class":
          stroke(255, 255, 230);
          break;

        case "Blue M-Class":
          stroke(220, 225, 255);
          break;

        case "Red Giant":
          stroke(255, 210, 210);
          break;
      }
      point(m[i * 2 - 2] + xOffset, m[i * 2 - 1] + yOffset);
    }

    strokeWeight(1);

    //
    if (mouseIsPressed && mouseX < 500 + xOffset) {
      for (let i = 1; i <= m.length / 2; i++) {
        dis = sqrt(
          abs(mouseX - (m[i * 2 - 2] + xOffset)) ** 2 + abs(mouseY - (m[i * 2 - 1] + yOffset)) ** 2
        );
        if (dis < Bdis) {
          Bdis = dis;
          cS = i;
        }
      }
    }
    if (Bdis > 30 && mouseIsPressed && mouseX < 500) {
      cS = "null";
    }

    Bdis = 1000;

    stroke(themePrimary);
    line(500 + xOffset, 0 + yOffset, 500 + xOffset, 500 + yOffset);

    noStroke();
    fill(themePrimary);

    if (cS != "null") {
      text("Selected Star:", 520 + xOffset, 10 + yOffset);

      text(inf[cS], 520 + xOffset, 30 + yOffset);
      text(floor(m[cS * 2 - 2]) + ", " + floor(m[cS * 2 - 1]), 520 + xOffset, 50 + yOffset);
      text(cl[cS], 520 + xOffset, 70 + yOffset);
      text("Celestial Objects: " + sys[cS].length, 520 + xOffset, 90 + yOffset);
      text("Space Stations: " + stations[cS].length, 520 + xOffset, 110 + yOffset);

      dis = round(
        sqrt(
          abs(m[Pstar * 2 - 2] - m[cS * 2 - 2]) ** 2 +
            abs(m[Pstar * 2 - 1] - m[cS * 2 - 1]) ** 2
        )
      );
      text("distance: " + dis + " LY", 520 + xOffset, 140 + yOffset);
      if (dis <= maxJump) {
        stroke(50, 220, 255);
      } else {
        stroke(100);
      }
      JbuttonEnabled = dis <= maxJump;
      strokeWeight(1.5);
      line(m[Pstar * 2 - 2] + xOffset, m[Pstar * 2 - 1] + yOffset, m[cS * 2 - 2] + xOffset, m[cS * 2 - 1] + yOffset);
      strokeWeight(1);
    } else {
      text("Current Star:", 520 + xOffset, 10 + yOffset);

      text(inf[Pstar], 520 + xOffset, 30 + yOffset);
      text(floor(m[Pstar * 2 - 2]) + ", " + floor(m[Pstar * 2 - 1]), 520 + xOffset, 50 + yOffset);
      text(cl[Pstar], 520 + xOffset, 70 + yOffset);
      text("Celestial Objects: " + sys[Pstar].length, 520 + xOffset, 90 + yOffset);
      text("Space Stations: " + stations[Pstar].length, 520 + xOffset, 110 + yOffset);
      dis = 0;
      JbuttonEnabled = dis <= maxJump;
    }

    noFill();
    stroke(themePrimary);

    if (cS != "null") {
      ellipse(m[cS * 2 - 2] + xOffset, m[cS * 2 - 1] + yOffset, 10, 10);
    }

    stroke(themeSecondary);
    ellipse(m[Pstar * 2 - 2] + xOffset, m[Pstar * 2 - 1] + yOffset, 6, 6);

    if (dis > maxJump && cS != "null") {
      setButtonEnabled("Jump Button", false);
      setButtonEnabled("System Button", false);

      strokeWeight(3);
      stroke(120);
      fill(60);
      rect(520.5 + xOffset, 440.5 + yOffset, 160, 40);
      noStroke();
      fill(120);
      textSize(25);
      textAlign(CENTER, CENTER);
      text("too far", 520.5 + xOffset, 440.5 + yOffset, 160, 40);
    } else {
      if (dis == 0 || cS == "null") {
        setButtonEnabled("Jump Button", false);
        setButtonEnabled("System Button", true);
      } else if (cS != "null") {
        setButtonEnabled("Jump Button", true);
        setButtonEnabled("System Button", false);
      }
    }
    
    stroke(themePrimary)
    strokeWeight(2)
    noFill()
    rect(xOffset,yOffset,700,500)
  }

  if (screen == "SYSTEM") {
    
    let xOffset = round((windowWidth/2)-350)
    let yOffset = round((windowHeight/2)-250)
    
    noStroke()
    fill(10,10,15)
    rect(xOffset,yOffset,700,500)
    
    if (!buttonsLoaded) {
      clearButtons();
      // newButton(name,displayText,textsize,X,Y,W,H,Col1,Col2,ColP1,ColP2,bWidth,func,alx,aly)

      newButton(
        "Stars Button",
        "star map",
        25,
        520 + xOffset,
        440 + yOffset,
        160,
        40,
        themeTertiary,
        themeTertiaryDark,
        themeTertiary,
        themeTertiaryDark,
        3,
        function () {
          buttonsLoaded = false;
          screen = "STARS";
          cP = "null";
          cSt = "null";
        },
        CENTER,
        CENTER
      );
      setButtonEnabled("Stars Button", true);

      newButton(
        "Station Button",
        "Set Destination",
        20,
        520 + xOffset,
        380 + yOffset,
        160,
        40,
        themeSecondary,
        themeSecondaryDark,
        themeSecondary,
        themeSecondaryDark,
        3,
        function () {
          screen = "NONE";
          buttonsLoaded = false;
          clearButtons()
          destination = "S-"+Pstar+"-S-"+cSt
        },
        CENTER,
        CENTER
      );

      buttonsLoaded = true;
    }

    if (mouseX < 500 + xOffset && mouseY < 500 + yOffset && mouseX > xOffset && mouseY > yOffset) {
      noCursor();
    }

    strokeWeight(3);

    for (let i = 0; i < sys[Pstar].length; i++) {
      if (sys[Pstar][i][0] == "Asteroid Belt") {
        stroke(71, 40, 16);
        noFill();
        strokeWeight(sys[Pstar][i][2]);
        ellipse(250 + xOffset, 250 + yOffset, sys[Pstar][i][1] * 2, sys[Pstar][i][1] * 2);
      }
    }

    strokeWeight(3);
    switch (cl[Pstar]) {
      case "Red M-Class":
        fill(255, 235, 235);
        stroke(240, 225, 225);
        ellipse(250 + xOffset, 250 + yOffset, 30, 30);
        break;

      case "Yellow M-Class":
        fill(255, 255, 230);
        stroke(240, 240, 215);
        ellipse(250 + xOffset, 250 + yOffset, 33, 33);
        break;

      case "Blue M-Class":
        fill(220, 225, 255);
        stroke(205, 210, 240);
        ellipse(250 + xOffset, 250 + yOffset, 36, 36);
        break;

      case "Red Giant":
        fill(255, 210, 210);
        stroke(240, 195, 195);
        ellipse(250 + xOffset, 250 + yOffset, 40, 40);
        break;

      case "Neutron Star":
        fill(240, 240, 255);
        stroke(225, 225, 240);
        ellipse(250 + xOffset, 250 + yOffset, 5, 5);
        break;

      case "White Dwarf":
        fill(255, 255, 255);
        stroke(240, 240, 240);
        ellipse(250 + xOffset, 250 + yOffset, 10, 10);
        break;
    }
    for (let i = 0; i < sys[Pstar].length; i++) {
      if (sys[Pstar][i][0] == "Asteroid Belt") {
        stroke(sys[Pstar][i][4]);
        noFill();
        strokeWeight(sys[Pstar][i][2]);
        ellipse(250 + xOffset, 250 + yOffset, sys[Pstar][i][1] * 2, sys[Pstar][i][1] * 2);
      }
    }
    for (let i = 0; i < sys[Pstar].length; i++) {
      if (sys[Pstar][i][0] != "Asteroid Belt") {
        noFill();
        stroke(100);
        strokeWeight(1);
        ellipse(250 + xOffset, 250 + yOffset, sys[Pstar][i][1] * 2, sys[Pstar][i][1] * 2);
      }
    }
    for (let i = 0; i < sys[Pstar].length; i++) {
      if (sys[Pstar][i][0] != "Asteroid Belt") {
        noStroke();
        fill(sys[Pstar][i][4]);
        ellipse(
          250 + xOffset + sin(180 * dtCount * sys[Pstar][i][3]) * sys[Pstar][i][1],
          250 + yOffset + cos(180 * dtCount * sys[Pstar][i][3]) * sys[Pstar][i][1],
          sys[Pstar][i][2],
          sys[Pstar][i][2]
        );
      }
    }

    for (let i = 0; i < stations[Pstar].length; i++) {
      noFill();
      stroke(100);
      strokeWeight(1);
      ellipse(250 + xOffset, 250 + yOffset, stations[Pstar][i][1] * 2, stations[Pstar][i][1] * 2);
    }
    for (let i = 0; i < stations[Pstar].length; i++) {
      let centerX =
        250 + xOffset + sin(180 * dtCount * stations[Pstar][i][2]) * stations[Pstar][i][1];
      let centerY =
        250 + yOffset + cos(180 * dtCount * stations[Pstar][i][2]) * stations[Pstar][i][1];
      stroke(120);
      strokeWeight(1);
      fill(120);
      triangle(
        centerX,
        centerY + 5,
        centerX,
        centerY - 5,
        centerX - 5,
        centerY
      );
      triangle(
        centerX,
        centerY + 5,
        centerX,
        centerY - 5,
        centerX + 5,
        centerY
      );
      switch (stations[Pstar][i][0]) {
        case "Mining":
          fill(240, 160, 0);
          stroke(180, 140, 0);
          break;
        case "Refining":
          fill(240, 200, 0);
          stroke(240, 200, 0);
          break;
        case "Technology":
          fill(0, 50, 230);
          stroke(0, 50, 230);
          break;
        case "Organics":
          fill(0, 255, 20);
          stroke(0, 255, 20);
          break;
        case "Manufacturing":
          fill(120, 20, 0);
          stroke(240, 20, 20);
          break;
      }
      noStroke();
      rect(centerX - 3, centerY - 1, 6, 2);
    }

    // selecting
    Bdis = 1000;
    if (mouseIsPressed && mouseX < 500) {
      dis = sqrt(abs(mouseX - (250 + xOffset)) ** 2 + abs(mouseY - (250 + yOffset)) ** 2);
      if (dis <= 40) {
        cP = "star";
        Bdis = dis;
      }
    }
    ast = false;
    if (mouseIsPressed && mouseX < 500 + xOffset && mouseX > xOffset && mouseY < 500 + yOffset && mouseY > yOffset) {
      for (let i = 0; i < sys[Pstar].length; i++) {
        if (sys[Pstar][i][0] == "Asteroid Belt") {
          dis = sqrt(abs(mouseX - (250 + xOffset)) ** 2 + abs(mouseY - (250 + yOffset)) ** 2);
          if (
            dis <= sys[Pstar][i][1] + sys[Pstar][i][2] / 2 &&
            dis >= sys[Pstar][i][1] - sys[Pstar][i][2] / 2
          ) {
            cP = i;
            cSt = "null";
            ast = true;
          }
        }
      }
    }

    if (mouseIsPressed && mouseX < 500 + xOffset && mouseX > xOffset && mouseY < 500 + yOffset && mouseY > yOffset) {
      for (let i = 0; i < sys[Pstar].length; i++) {
        dis = sqrt(
          abs(
            mouseX -
              (250 + xOffset + sin(180 * dtCount * sys[Pstar][i][3]) * sys[Pstar][i][1])
          ) **
            2 +
            abs(
              mouseY -
                (250  + yOffset + cos(180 * dtCount * sys[Pstar][i][3]) * sys[Pstar][i][1])
            ) **
              2
        );
        if (dis < Bdis) {
          Bdis = dis;
          if (Bdis < 30) {
            cP = i;
            cSt = "null";
          }
        }
      }
    }

    if (mouseIsPressed && mouseX < 500 + xOffset && mouseX > xOffset && mouseY < 500 + yOffset && mouseY > yOffset) {
      for (let i = 0; i < stations[Pstar].length; i++) {
        dis = sqrt(
          abs(
            mouseX -
              (250 + xOffset + 
                sin(180 * dtCount * stations[Pstar][i][2]) *
                  stations[Pstar][i][1])
          ) ** 2 +
            abs(
              mouseY -
                (250 + yOffset +
                  cos(180 * dtCount * stations[Pstar][i][2]) *
                    stations[Pstar][i][1])
            ) ** 2
        );
        if (dis < Bdis) {
          Bdis = dis;
          if (Bdis < 30) {
            cP = "null";
            cSt = i;
          }
        }
      }
    }

    if (Bdis > 30 && mouseIsPressed && mouseX < 500 + xOffset && mouseX > xOffset && mouseY < 500 + yOffset && mouseY > yOffset && !ast) {
      cP = "null";
      cSt = "null";
    }

    setButtonEnabled("Station Button", false);
    strokeWeight(1);
    noStroke();
    fill(255);
    if (cP != "null" && cP != "star") {
      if (sys[Pstar][cP][0] == "Asteroid Belt") {
        noFill();
        stroke(themePrimary);
        let radius = sys[Pstar][cP][1] * 2;
        let Size = sys[Pstar][cP][2];

        arc(
          250 + xOffset,
          250 + yOffset,
          radius - (Size + 8),
          radius - (Size + 8),
          180 / 16,
          180 / 2 - 180 / 16
        );
        arc(
          250 + xOffset,
          250 + yOffset,
          radius - (Size + 8),
          radius - (Size + 8),
          180 / 2 + 180 / 16,
          180 - 180 / 16
        );
        arc(
          250 + xOffset,
          250 + yOffset,
          radius - (Size + 8),
          radius - (Size + 8),
          180 + 180 / 16,
          (3 * 180) / 2 - 180 / 16
        );
        arc(
          250 + xOffset,
          250 + yOffset,
          radius - (Size + 8),
          radius - (Size + 8),
          (3 * 180) / 2 + 180 / 16,
          180 * 2 - 180 / 16
        );

        arc(
          250 + xOffset,
          250 + yOffset,
          radius + (Size + 8),
          radius + (Size + 8),
          180 / 16,
          180 / 2 - 180 / 16
        );
        arc(
          250 + xOffset,
          250 + yOffset,
          radius + (Size + 8),
          radius + (Size + 8),
          180 / 2 + 180 / 16,
          180 - 180 / 16
        );
        arc(
          250 + xOffset,
          250 + yOffset,
          radius + (Size + 8),
          radius + (Size + 8),
          180 + 180 / 16,
          (3 * 180) / 2 - 180 / 16
        );
        arc(
          250 + xOffset,
          250 + yOffset,
          radius + (Size + 8),
          radius + (Size + 8),
          (3 * 180) / 2 + 180 / 16,
          180 * 2 - 180 / 16
        );
      } else {
        let centerX =
          250 + xOffset + sin(180 * dtCount * sys[Pstar][cP][3]) * sys[Pstar][cP][1];
        let centerY =
          250 + yOffset + cos(180 * dtCount * sys[Pstar][cP][3]) * sys[Pstar][cP][1];
        let Size = sys[Pstar][cP][2] / 2 + 5;
        stroke(themePrimary);
        line(
          centerX + Size,
          centerY + Size,
          centerX + Size,
          centerY + Size - Size / 5
        );
        line(
          centerX + Size,
          centerY + Size,
          centerX + Size - Size / 5,
          centerY + Size
        );

        line(
          centerX - Size,
          centerY + Size,
          centerX - Size,
          centerY + Size - Size / 5
        );
        line(
          centerX - Size,
          centerY + Size,
          centerX - Size + Size / 5,
          centerY + Size
        );

        line(
          centerX + Size,
          centerY - Size,
          centerX + Size,
          centerY - Size + Size / 5
        );
        line(
          centerX + Size,
          centerY - Size,
          centerX + Size - Size / 5,
          centerY - Size
        );

        line(
          centerX - Size,
          centerY - Size,
          centerX - Size,
          centerY - Size + Size / 5
        );
        line(
          centerX - Size,
          centerY - Size,
          centerX - Size + Size / 5,
          centerY - Size
        );
      }
      noStroke();
      fill(themePrimary);
      text(sys[Pstar][cP][5], 520 + xOffset, 20 + yOffset);
      text("Orbital Radius: " + round(sys[Pstar][cP][1]), 520 + xOffset, 40 + yOffset);
      text("Orbital speed: " + round(sys[Pstar][cP][3] * 2000) / 1000, 520 + xOffset, 60 + yOffset);
      text("Size: " + round(sys[Pstar][cP][2]), 520 + xOffset, 80 + yOffset);
    } else if (cP == "star") {
      let Size = 0;
      switch (cl[Pstar]) {
        case "Red M-Class":
          Size = 15.5;
          break;

        case "Yellow M-Class":
          Size = 33 / 2;
          break;

        case "Blue M-Class":
          Size = 18.5;
          break;

        case "Red Giant":
          Size = 20.5;
          break;

        case "Neutron Star":
          Size = 2.5;
          break;

        case "White Dwarf":
          Size = 5.5;
          break;
      }
      Size = Size + 3;
      let centerX = 250  + xOffset;
      let centerY = 250  + yOffset;
      stroke(themePrimary);
      line(
        centerX + Size,
        centerY + Size,
        centerX + Size,
        centerY + Size - Size / 5
      );
      line(
        centerX + Size,
        centerY + Size,
        centerX + Size - Size / 5,
        centerY + Size
      );

      line(
        centerX - Size,
        centerY + Size,
        centerX - Size,
        centerY + Size - Size / 5
      );
      line(
        centerX - Size,
        centerY + Size,
        centerX - Size + Size / 5,
        centerY + Size
      );

      line(
        centerX + Size,
        centerY - Size,
        centerX + Size,
        centerY - Size + Size / 5
      );
      line(
        centerX + Size,
        centerY - Size,
        centerX + Size - Size / 5,
        centerY - Size
      );

      line(
        centerX - Size,
        centerY - Size,
        centerX - Size,
        centerY - Size + Size / 5
      );
      line(
        centerX - Size,
        centerY - Size,
        centerX - Size + Size / 5,
        centerY - Size
      );

      noStroke();
      fill(themePrimary);
      text(inf[Pstar], 520 + xOffset, 20 + yOffset);
      text(cl[Pstar], 520 + xOffset, 40 + yOffset);
    } else if (cP == "null" && cSt != "null") {
      let centerX =
        250 + xOffset +
        sin(180 * dtCount * stations[Pstar][cSt][2]) * stations[Pstar][cSt][1];
      let centerY =
        250 + yOffset +
        cos(180 * dtCount * stations[Pstar][cSt][2]) * stations[Pstar][cSt][1];
      let Size = 8;
      stroke(themePrimary);
      line(
        centerX + Size,
        centerY + Size,
        centerX + Size,
        centerY + Size - Size / 5
      );
      line(
        centerX + Size,
        centerY + Size,
        centerX + Size - Size / 5,
        centerY + Size
      );

      line(
        centerX - Size,
        centerY + Size,
        centerX - Size,
        centerY + Size - Size / 5
      );
      line(
        centerX - Size,
        centerY + Size,
        centerX - Size + Size / 5,
        centerY + Size
      );

      line(
        centerX + Size,
        centerY - Size,
        centerX + Size,
        centerY - Size + Size / 5
      );
      line(
        centerX + Size,
        centerY - Size,
        centerX + Size - Size / 5,
        centerY - Size
      );

      line(
        centerX - Size,
        centerY - Size,
        centerX - Size,
        centerY - Size + Size / 5
      );
      line(
        centerX - Size,
        centerY - Size,
        centerX - Size + Size / 5,
        centerY - Size
      );

      noStroke();
      fill(themePrimary);
      text(stations[Pstar][cSt][3] + " station", 520 + xOffset, 20 + yOffset);
      text(stations[Pstar][cSt][0], 520 + xOffset, 40 + yOffset);
      text("Orbital Radius: " + round(stations[Pstar][cSt][1]), 520 + xOffset, 60 + yOffset);
      text(
        "Orbital speed: " + round(stations[Pstar][cSt][2] * 2000) / 1000,
        520 + xOffset,
        80 + yOffset
      );
      setButtonEnabled("Station Button", true);
    } else {
      text("none selected", 520 + xOffset, 20 + yOffset);
    }

    // cursor stuff
    strokeWeight(1);

    stroke(themeTertiary);

    line(
      min(max(mouseX + 0.5, xOffset), 500 + xOffset),
      yOffset,
      min(max(mouseX + 0.5, xOffset), 500 + xOffset),
      min(max(mouseY - 20, yOffset), 500 + yOffset)
    );
    line(
      min(max(mouseX + 0.5, xOffset), 500 + xOffset),
      500 + yOffset,
      min(max(mouseX + 0.5, xOffset), 500 + xOffset),
      min(max(mouseY + 20, yOffset), 500 + yOffset)
    );

    stroke(themeSecondary);

    line(
      xOffset,
      min(max(mouseY + 0.5, yOffset), 500 + yOffset),
      min(max(mouseX - 20, xOffset), 500 + xOffset),
      min(max(mouseY + 0.5, yOffset), 500 + yOffset)
    );
    line(
      500 + xOffset,
      min(max(mouseY + 0.5, yOffset), 500 + yOffset),
      min(max(mouseX + 20, xOffset), 500 + xOffset),
      min(max(mouseY + 0.5, yOffset), 500 + yOffset)
    );

    stroke(themePrimary);
    line(500.5 + xOffset, yOffset, 500.5 + xOffset, 500 + yOffset);
    
    noFill()
    stroke(themePrimary)
    strokeWeight(2)
    rect(xOffset,yOffset,700,500)
    strokeWeight(1)
  }

  if (screen == "STATION") {
    
    let xOffset = round((windowWidth/2)-350)
    let yOffset = round((windowHeight/2)-250)
    
    noStroke()
    fill(10,10,15)
    rect(xOffset,yOffset,700,500)
    
    var prices = [];
    for (let p = 0; p < stations[Pstar][Pstation][4].length; p++) {
      if (stations[Pstar][Pstation][4].length > p) {
        var demandMult =
          stations[Pstar][Pstation][4][p][2] /
          stations[Pstar][Pstation][4][p][1];
        if (demandMult > 1.25) demandMult = 1.25;
        if (demandMult < 0.75) demandMult = 0.75;

        for (let i = 0; i < commod.length; i++) {
          if (commod[i][0] == stations[Pstar][Pstation][4][p][0]) {
            prices[p] =
              commod[i][1] * demandMult + stations[Pstar][Pstation][4][p][3];
          }
        }
        prices[p] = round(prices[p], 2);
      }
    }

    // create station buttons
    if (!buttonsLoaded) {
      clearButtons();
      buysell = 0;
      // newButton(name,displayText,textsize,X,Y,W,H,Col1,Col2,ColP1,ColP2,bWidth,func,alx,aly,pad)
      newButton(
        "Exit Button",
        "UNDOCK",
        25,
        520 + xOffset,
        440 + yOffset,
        160,
        40,
        themeTertiary,
        themeTertiaryDark,
        themeTertiary,
        themeTertiaryDark,
        3,
        function () {
          shipJoint.remove()
          buttonsLoaded = false;
          clearButtons()
          screen = "NONE";
          cP = "null";
          cSt = "null";
          sComm = "null";
          TS = 0;
          docked = false;
        },
        CENTER,
        CENTER
      );
      setButtonEnabled("Exit Button", true);

      for (let b = 0; b < 5; b++)
        if (stations[Pstar][Pstation][4].length > b) {
          var Text = " item: " + stations[Pstar][Pstation][4][TS + b][0];
          if (stations[Pstar][Pstation][4][TS + b][4] == 1) {
            Text = Text + "\n buying";
          } else if (stations[Pstar][Pstation][4][TS + b][4] == 2) {
            Text = Text + "\n selling";
          } else if (stations[Pstar][Pstation][4][TS + b][4] == 3) {
            Text = Text + "\n buying and selling";
          }
          Text =
            Text +
            "\n price: " +
            prices[TS + b] +
            "\n stock: " +
            stations[Pstar][Pstation][4][TS + b][2];
          newButton(
            "Commod Button " + (b + 1),
            Text,
            12,
            50 + xOffset,
            90 + yOffset + b * 75,
            170,
            65,
            themeSecondary,
            color(10, 10, 15),
            themeSecondary,
            color(10, 10, 15),
            1,
            function () {
              sComm = b + TS;
              buysell = 0;
              Tmult = 1;
              cart = 0;
              setButtonColors(
                "Buy Button",
                themeSecondary,
                color(10, 10, 15),
                themeSecondary,
                color(10, 10, 15)
              );
              setButtonColors(
                "Sell Button",
                themeSecondary,
                color(10, 10, 15),
                themeSecondary,
                color(10, 10, 15)
              );
              setButtonColors(
                "1x Button",
                themeTertiary,
                color(10, 10, 15),
                themeTertiary,
                color(10, 10, 15)
              );
              setButtonColors(
                "10x Button",
                themeSecondary,
                color(10, 10, 15),
                themeSecondary,
                color(10, 10, 15)
              );
              setButtonColors(
                "100x Button",
                themeSecondary,
                color(10, 10, 15),
                themeSecondary,
                color(10, 10, 15)
              );
            },
            LEFT,
            CENTER,
            3
          );
          setButtonEnabled("Commod Button " + (b + 1), true);
        }

      if (stations[Pstar][Pstation][4].length > 5) {
        newButton(
          "Down Button",
          "🡇",
          30,
          230 + xOffset,
          415 + yOffset,
          40,
          40,
          themeSecondary,
          color(10, 10, 15),
          themeSecondary,
          color(10, 10, 15),
          1,
          function () {
            if (TS + 5 < stations[Pstar][Pstation][4].length) {
              TS++;
              for (let b = 0; b < 5; b++) {
                if (stations[Pstar][Pstation][4].length > b) {
                  var Text =
                    " item: " + stations[Pstar][Pstation][4][TS + b][0];
                  if (stations[Pstar][Pstation][4][TS + b][4] == 1) {
                    Text = Text + "\n buying";
                  } else if (stations[Pstar][Pstation][4][TS + b][4] == 2) {
                    Text = Text + "\n selling";
                  } else if (stations[Pstar][Pstation][4][TS + b][4] == 3) {
                    Text = Text + "\n buying and selling";
                  }
                  Text =
                    Text +
                    "\n price: " +
                    prices[TS + b] +
                    "\n stock: " +
                    stations[Pstar][Pstation][4][TS + b][2];
                  setButtonText("Commod Button " + (b + 1), Text);
                }
              }
            }
          },
          CENTER,
          CENTER,
          0
        );
        setButtonEnabled("Down Button", true);

        newButton(
          "Up Button",
          "🡅",
          30,
          230 + xOffset,
          90 + yOffset,
          40,
          40,
          themeSecondary,
          color(10, 10, 15),
          themeSecondary,
          color(10, 10, 15),
          1,
          function () {
            if (TS > 0) {
              TS--;
              for (let b = 0; b < 5; b++) {
                var Text = " item: " + stations[Pstar][Pstation][4][TS + b][0];
                if (stations[Pstar][Pstation][4][TS + b][4] == 1) {
                  Text = Text + "\n buying";
                } else if (stations[Pstar][Pstation][4][TS + b][4] == 2) {
                  Text = Text + "\n selling";
                } else if (stations[Pstar][Pstation][4][TS + b][4] == 3) {
                  Text = Text + "\n buying and selling";
                }
                Text =
                  Text +
                  "\n price: " +
                  prices[TS + b] +
                  "\n stock: " +
                  stations[Pstar][Pstation][4][TS + b][2];
                if (stations[Pstar][Pstation][4].length > b) {
                  setButtonText("Commod Button " + (b + 1), Text);
                }
              }
            }
          },
          CENTER,
          CENTER,
          0
        );
        setButtonEnabled("Up Button", true);
      }

      newButton(
        "Buy Button",
        "buy",
        18,
        300 + xOffset,
        210 + yOffset,
        75,
        30,
        themeSecondary,
        color(10, 10, 15),
        themeSecondary,
        color(10, 10, 15),
        1,
        function () {
          cart = 0;
          if (sComm != "null") {
            if (
              stations[Pstar][Pstation][4][sComm][4] == 2 ||
              stations[Pstar][Pstation][4][sComm][4] == 3
            ) {
              buysell = 1;
              setButtonColors(
                "Buy Button",
                themeTertiary,
                color(10, 10, 15),
                themeTertiary,
                color(10, 10, 15)
              );
              setButtonColors(
                "Sell Button",
                themeSecondary,
                color(10, 10, 15),
                themeSecondary,
                color(10, 10, 15)
              );
            }
          }
        },
        CENTER,
        CENTER,
        0
      );
      setButtonEnabled("Buy Button", true);

      newButton(
        "Sell Button",
        "sell",
        18,
        385 + xOffset,
        210 + yOffset,
        75,
        30,
        themeSecondary,
        color(10, 10, 15),
        themeSecondary,
        color(10, 10, 15),
        1,
        function () {
          cart = 0;
          if (sComm != "null") {
            if (
              stations[Pstar][Pstation][4][sComm][4] == 1 ||
              stations[Pstar][Pstation][4][sComm][4] == 3
            ) {
              buysell = 2;
              setButtonColors(
                "Sell Button",
                themeTertiary,
                color(10, 10, 15),
                themeTertiary,
                color(10, 10, 15)
              );
              setButtonColors(
                "Buy Button",
                themeSecondary,
                color(10, 10, 15),
                themeSecondary,
                color(10, 10, 15)
              );
            }
          }
        },
        CENTER,
        CENTER,
        0
      );
      setButtonEnabled("Sell Button", true);

      newButton(
        "1x Button",
        "1",
        19,
        300 + xOffset,
        250 + yOffset,
        45,
        30,
        themeTertiary,
        color(10, 10, 15),
        themeTertiary,
        color(10, 10, 15),
        1,
        function () {
          Tmult = 1;
          setButtonColors(
            "1x Button",
            themeTertiary,
            color(10, 10, 15),
            themeTertiary,
            color(10, 10, 15)
          );
          setButtonColors(
            "10x Button",
            themeSecondary,
            color(10, 10, 15),
            themeSecondary,
            color(10, 10, 15)
          );
          setButtonColors(
            "100x Button",
            themeSecondary,
            color(10, 10, 15),
            themeSecondary,
            color(10, 10, 15)
          );
        }
      );
      setButtonEnabled("1x Button", true);

      newButton(
        "10x Button",
        "10",
        19,
        357.5 + xOffset,
        250 + yOffset,
        45,
        30,
        themeSecondary,
        color(10, 10, 15),
        themeSecondary,
        color(10, 10, 15),
        1,
        function () {
          Tmult = 10;
          setButtonColors(
            "10x Button",
            themeTertiary,
            color(10, 10, 15),
            themeTertiary,
            color(10, 10, 15)
          );
          setButtonColors(
            "1x Button",
            themeSecondary,
            color(10, 10, 15),
            themeSecondary,
            color(10, 10, 15)
          );
          setButtonColors(
            "100x Button",
            themeSecondary,
            color(10, 10, 15),
            themeSecondary,
            color(10, 10, 15)
          );
        }
      );
      setButtonEnabled("10x Button", true);

      newButton(
        "100x Button",
        "100",
        19,
        415 + xOffset,
        250 + yOffset,
        45,
        30,
        themeSecondary,
        color(10, 10, 15),
        themeSecondary,
        color(10, 10, 15),
        1,
        function () {
          Tmult = 100;
          setButtonColors(
            "100x Button",
            themeTertiary,
            color(10, 10, 15),
            themeTertiary,
            color(10, 10, 15)
          );
          setButtonColors(
            "10x Button",
            themeSecondary,
            color(10, 10, 15),
            themeSecondary,
            color(10, 10, 15)
          );
          setButtonColors(
            "1x Button",
            themeSecondary,
            color(10, 10, 15),
            themeSecondary,
            color(10, 10, 15)
          );
        }
      );
      setButtonEnabled("100x Button", true);

      newButton(
        "Plus Button",
        "+",
        20,
        300 + xOffset,
        290 + yOffset,
        75,
        30,
        themeSecondary,
        color(10, 10, 15),
        themeTertiary,
        color(10, 10, 15),
        1,
        function () {
          if (sComm != "null") {
            cart += Tmult;
            if (buysell == 1) {
              // checks if the amount you are trying to buy is more than the station's stock
              if (cart > stations[Pstar][Pstation][4][sComm][2])
                cart = stations[Pstar][Pstation][4][sComm][2];
              // checks if the amount you are trying to buy is more than you can hold
              let maxAdd = addCargo(
                stations[Pstar][Pstation][4][sComm][0],
                cart
              )[2];
              if (cart > maxAdd) cart = maxAdd;
            } else if (buysell == 2) {
              // checks if you are trying to sell more than you have
              let maxAdd = getCargo(stations[Pstar][Pstation][4][sComm][0]);
              if (cart > maxAdd) cart = maxAdd;
            }
          }
        },
        CENTER,
        CENTER,
        0
      );
      setButtonEnabled("Plus Button", true);

      newButton(
        "Minus Button",
        "-",
        20,
        385 + xOffset,
        290 + yOffset,
        75,
        30,
        themeSecondary,
        color(10, 10, 15),
        themeTertiary,
        color(10, 10, 15),
        1,
        function () {
          if (sComm != "null") {
            cart -= Tmult;
            if (cart < 0) cart = 0;
          }
        },
        CENTER,
        CENTER,
        0
      );
      setButtonEnabled("Minus Button", true);

      newButton(
        "Confirm Button",
        "confirm",
        15,
        300 + xOffset,
        360 + yOffset,
        160,
        25,
        themeSecondary,
        color(10, 10, 15),
        themeTertiary,
        color(10, 10, 15),
        1,
        function () {
          if (sComm != "null") {
            let P = tradePrice(true, stations[Pstar][Pstation][4][sComm], cart);
            if (P <= credits && buysell == 1) {
              credits -= P;
              cargo = addCargo(stations[Pstar][Pstation][4][sComm][0], cart)[0];
              stations[Pstar][Pstation][4][sComm][2] -= cart;
            } else if (buysell == 2) {
              credits += P;
              cargo = removeCargo(
                stations[Pstar][Pstation][4][sComm][0],
                cart
              )[0];
              stations[Pstar][Pstation][4][sComm][2] += cart;
            }
            cart = 0;
            credits = round(credits, 2);
          }
        }
      );
      setButtonEnabled("Confirm Button", true);

      buttonsLoaded = true;
    }

    let stationInv = stations[Pstar][Pstation][4];

    if (stations[Pstar][Pstation][4].length > 5) {
      const Start = 150;
      const End = 400;

      fill(10, 10, 15);
      stroke(themeSecondary);
      rect(230.5 + xOffset, Start + yOffset, 40, End - Start);

      fill(themeSecondary);
      stroke(themeSecondary);
      rect(
        230.5 + xOffset,
        Start + yOffset +
          ((End - Start) / stations[Pstar][Pstation][4].length) * TS +
          0.5,
        40,
        ((End - Start) / stations[Pstar][Pstation][4].length) * 5
      );
    }

    stroke(themeSecondary);
    line(290.5 + xOffset, 70.5 + yOffset, 290.5 + xOffset, 470.5 + yOffset);

    line(290.5 + xOffset, 200.5 + yOffset, 470.5 + xOffset, 200.5 + yOffset);

    noStroke();
    fill(themeSecondary);
    if (sComm != "null") {
      let comdat;
      for (let i = 0; i < commod.length; i++) {
        if (commod[i][0] == stations[Pstar][Pstation][4][sComm][0]) {
          comdat = deepCopy(commod[i]);
        }
      }

      textSize(13);
      text(stations[Pstar][Pstation][4][sComm][0], 300.5 + xOffset, 80.5 + yOffset);
      text("Price: " + prices[sComm] + " credits", 300.5 + xOffset, 100.5 + yOffset);
      text("Weight: " + comdat[4], 300.5 + xOffset, 120.5 + yOffset);
      text(
        "Stock: " + stations[Pstar][Pstation][4][sComm][2],
        300.5 + xOffset,
        140.5 + yOffset,
        150,
        30
      );
      text(
        "Demand: " + stations[Pstar][Pstation][4][sComm][1] + " units",
        300.5 + xOffset,
        160.5 + yOffset
      );
      text(
        "Price Offset: " + stations[Pstar][Pstation][4][sComm][3] + " credits",
        300.5 + xOffset,
        180.5 + yOffset
      );
    }

    textSize(14);
    if (buysell == 0) {
      text("Cart: N/A", 300 + xOffset, 330 + yOffset);
      text("Price: N/A", 300 + xOffset, 345 + yOffset);
    } else {
      text("Cart: " + cart, 300 + xOffset, 330 + yOffset);
      if (buysell == 1) {
        text(
          "Price: " + round(tradePrice(true, stationInv[sComm], cart), 2),
          300 + xOffset,
          345 + yOffset
        );
      } else if (buysell == 2) {
        text(
          "Price: " + round(tradePrice(false, stationInv[sComm], cart), 2),
          300 + xOffset,
          345 + yOffset
        );
      }
    }

    noStroke();
    fill(255);
    textSize(13);
    text("credits: " + credits, 520 + xOffset, 20 + yOffset);

    text("cargo:", 520 + xOffset, 50 + yOffset);
    let dispCarg = displayCargo(cargo);
    let dispSize = 150 / (cargo.length / 2) - 2.5;

    for (let i = 0; i < dispCarg.length; i++) {
      noFill();
      strokeWeight(1);
      stroke(dispCarg[i][1]);
      rect(
        (dispSize + 5) * (i % floor(cargo.length / 2)) + 525.5 + xOffset,
        80.5 + floor(i / floor(cargo.length / 2)) * (dispSize + 5) + yOffset,
        dispSize,
        dispSize
      );

      fill(dispCarg[i][1]);
      rect(
        (dispSize + 5) * (i % floor(cargo.length / 2)) + 525.5 + xOffset,
        80.5 + yOffset +
          floor(i / floor(cargo.length / 2)) * (dispSize + 5) +
          dispSize * (1 - dispCarg[i][0]),
        dispSize,
        dispSize * dispCarg[i][0]
      );
    }

    noStroke();
    fill(themeSecondary);
    textSize(20);
    textAlign(LEFT, CENTER);
    text(
      stations[Pstar][Pstation][3] +
        " " +
        stations[Pstar][Pstation][0] +
        " station",
      30 + xOffset,
      30 + yOffset,
      300,
      30
    );
    noFill();
    stroke(themeSecondary);
    strokeWeight(1);
    rect(30.5 + xOffset, 70.5 + yOffset, 440, 400);

    strokeWeight(1);
    stroke(themePrimary);
    line(500.5 + xOffset, yOffset, 500.5 + xOffset, 500 + yOffset);
    strokeWeight(2);
    rect(xOffset, yOffset, 700, 500)
  }
  
  if (screen == "SHIP"){
    let SW = 700
    let SH = 500
    
    let xOffset = round((windowWidth/2)-(SW/2))
    let yOffset = round((windowHeight/2)-(SH/2))
    
    stroke(themeSecondary)
    strokeWeight(2)
    stroke(themePrimary);
    fill(10,10,15)
    rect(xOffset,yOffset,SW,SH)
    
    if(!buttonsLoaded){
      clearButtons();
      // newButton(name,displayText,textsize,X,Y,W,H,Col1,Col2,ColP1,ColP2,bWidth,func,alx,aly)
      
      
      
      buttonsLoaded = true;
    }
    
    
  }
  
  if(screen == "PAUSE"){
    
    let xOffset = round((windowWidth/2)-100)
    let yOffset = round((windowHeight/2)-150)
    
    stroke(themeSecondary)
    strokeWeight(2)
    fill(10,10,25)
    rect(xOffset,yOffset,200,300)
    
    if (!buttonsLoaded) {
      clearButtons();
      // newButton(name,displayText,textsize,X,Y,W,H,Col1,Col2,ColP1,ColP2,bWidth,func,alx,aly)
      newButton("Resume Button","resume",20,xOffset + 5, yOffset + 5, 190, 30, themeSecondary, color(10,10,15), themeSecondary, color(10,10,15), 2, function(){
        paused = false;
        screen = "NONE"
        buttonsLoaded = false
        clearButtons()
      })
      
      setButtonEnabled("Resume Button", true)
      
      newButton("FPS Counter Button","FPS counter: " + (FPScounter ? "on" : "off"),20,xOffset + 5, yOffset + 265, 190, 30, themeSecondary, color(10,10,15), themeSecondary, color(10,10,15), 2, function(){
        FPScounter = !FPScounter
        setButtonText("FPS Counter Button", "FPS counter: " + (FPScounter ? "on" : "off"))
      })
      
      setButtonEnabled("FPS Counter Button", true)

      buttonsLoaded = true;
    }
    
    textSize(16)
    noStroke()
    fill(themeSecondary)
    text("CONTROLS\nMove: WASD / arrow keys\nOpen/Close Map: M\nHyper-Jump: J\nDock: E\nExit Menu: escape\nPause: escape\n\nsettings and saving\ncoming soon(ish)",xOffset + 10, yOffset + 50)
  }
  
  
  
  // draw buttons
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i][0]) {
      let Hover =
        mouseX > buttons[i][4] &&
        mouseX < buttons[i][4] + buttons[i][6] &&
        mouseY > buttons[i][5] &&
        mouseY < buttons[i][5] + buttons[i][7];
      strokeWeight(buttons[i][12]);
      textAlign(buttons[i][14], buttons[i][15]);
      if (!Hover) {
        stroke(buttons[i][8]);
        fill(buttons[i][9]);
        rect(
          buttons[i][4] + 0.5,
          buttons[i][5] + 0.5,
          buttons[i][6],
          buttons[i][7]
        );
        noStroke();
        fill(buttons[i][8]);
        textSize(buttons[i][3]);
        text(
          buttons[i][2],
          buttons[i][4] + 0.5 + buttons[i][16],
          buttons[i][5] + 0.5 + buttons[i][16],
          buttons[i][6] - buttons[i][16] * 2,
          buttons[i][7] - buttons[i][16] * 2
        );
      } else if (Hover) {
        stroke(buttons[i][10]);
        fill(buttons[i][10]);
        rect(
          buttons[i][4] + 0.5,
          buttons[i][5] + 0.5,
          buttons[i][6],
          buttons[i][7]
        );
        noStroke();
        fill(buttons[i][11]);
        textSize(buttons[i][3]);
        text(
          buttons[i][2],
          buttons[i][4] + 0.5 + buttons[i][16],
          buttons[i][5] + 0.5 + buttons[i][16],
          buttons[i][6] - buttons[i][16] * 2,
          buttons[i][7] - buttons[i][16] * 2
        );
        cursor(HAND);
      }
    }
  }
  
}
