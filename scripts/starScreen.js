function starScreen() {
  
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
        consoleMessage("destination set: " + destination, 5)
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