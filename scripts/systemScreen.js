function systemScreen(){
  
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
        consoleMessage("destination set: " + destination, 5)
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