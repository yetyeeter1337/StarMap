function stationScreen(){
  
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
        consoleMessage("undock successful", 5)
        docked = false;
      },
      CENTER,
      CENTER
    );
    setButtonEnabled("Exit Button", true);

    newButton(
      "Repair Button",
      `repair: ${playerShip.maxIntegrity - playerShip.integrity} C`,
      15,
      520 + xOffset,
      200 + yOffset,
      160,
      30,
      themeSecondary,
      themeSecondaryDark,
      themeSecondary,
      themeSecondaryDark,
      3,
      function () {
        if(credits >= playerShip.maxIntegrity - playerShip.integrity){
          credits -= playerShip.maxIntegrity - playerShip.integrity
          playerShip.integrity = playerShip.maxIntegrity
        } else {
          playerShip.integrity += credits
          credits = 0
        }
        setButtonText("Repair Button", `repair: ${playerShip.maxIntegrity - playerShip.integrity} C`)
      },
      CENTER,
      CENTER
    );
    setButtonEnabled("Repair Button", true);

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
            consoleMessage("transaction successful, " + round(P,2) + " credits deducted from account", 5)
            cargo = addCargo(stations[Pstar][Pstation][4][sComm][0], cart)[0];
            stations[Pstar][Pstation][4][sComm][2] -= cart;
          } else if (buysell == 2) {
            credits += P;
            consoleMessage("transaction successful, " + round(P,2) + " credits added to account", 5)
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

  if (stationInv.length > 5) {
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
        ((End - Start) / stationInv.length) * TS +
        0.5,
      40,
      ((End - Start) / stationInv.length) * 5
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
      if (commod[i][0] == stationInv[sComm][0]) {
        comdat = commod[i]
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
  fill(themePrimary);
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

  // hull integrity and repairs

  noStroke();
  fill(themePrimary);
  textSize(13);
  text("hull:", 520 + xOffset, 180 + yOffset);

  /*
  if(playerShip.integrity / playerShip.maxIntegrity > 0.5){
    stroke(255)
  } else if(playerShip.integrity / playerShip.maxIntegrity <= 0.5 && playerShip.integrity / playerShip.maxIntegrity > 0.2){
    stroke(255,255,0)
  } else if(playerShip.integrity / playerShip.maxIntegrity <= 0.2){
    stroke(255,0,0)
  }
  strokeWeight(2)
  noFill()

  rect(520 + xOffset, 200 + yOffset, 160, 20)
  line(520 + xOffset + ( 160 * (playerShip.integrity / playerShip.maxIntegrity) ), 200 + yOffset, 520 + xOffset + ( 160 * (playerShip.integrity / playerShip.maxIntegrity) ), 220 + yOffset)

  noStroke()
  fill(themePrimary)
  textSize(15)
  textAlign(LEFT,CENTER)
  text( playerShip.integrity + "/" + playerShip.maxIntegrity, 525 + xOffset, 200 + yOffset, 160, 20)
  */

  // fuel and refueling

  noStroke();
  fill(themePrimary);
  textSize(13);
  text("fuel:", 520 + xOffset, 250 + yOffset);

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