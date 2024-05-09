// this only works in the context of the main sketch

function generateWorld(){
  
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
}