var escargo = 0; // I really thought I was funny
var Cscroll = 0;

function shipScreen(){

    let SW = 700
    let SH = 500
    
    let xOffset = round((windowWidth/2)-(SW/2)) + 0.5
    let yOffset = round((windowHeight/2)-(SH/2)) + 0.5
    
    stroke(themeSecondary)
    strokeWeight(1.5)
    stroke(themePrimary);
    fill(10,10,15)
    rect(xOffset,yOffset,SW,SH)

    let cargoButtons = 8
    let buttonDistance = 30

    let dispCargo = displayCargo(cargo)

    if(!buttonsLoaded){
      clearButtons();
      // newButton(name,displayText,textsize,X,Y,W,H,Col1,Col2,ColP1,ColP2,bWidth,func,alx,aly)
      
      for(let i = 0; i < cargoButtons; i++){
        newButton("Cargo Button "+i,"",1,
        xOffset + 20, yOffset + 90 + (i*buttonDistance),
            250, 25,
            dispCargo[i][1],color(10,10,15),dispCargo[i][1],color(10,10,15),2,
        function(){
            escargo = Cscroll + i
        }, CENTER, CENTER)
        setButtonEnabled("Cargo Button "+i, true)
      }

      newButton("Eject Button","eject",30,
      xOffset + 20, yOffset + 95 + (cargoButtons * buttonDistance), 135, 40,
      color(255,0,0),color(10,10,15),color(255,0,0),color(10,10,15),
      2, function(){
        clearStack(escargo)
        buttonsLoaded = false
        clearButtons()
      }
      )
      setButtonEnabled("Eject Button", true)
      
      buttonsLoaded = true;
    }
    
    textSize(30)
    noStroke()
    fill(themePrimary)
    text("ship management", xOffset + 20, yOffset + 20)
    
    textSize(20)
    text("cargo", xOffset + 20, yOffset + 60)
    text("modules", xOffset + 350, yOffset + 60)
    
    noFill()
    stroke(themePrimary)
    strokeWeight(1)
    
    
    for(let i = 0; i < cargoButtons; i++){
        drawButton("Cargo Button "+i)
        rect(xOffset + 45, yOffset + 110 + (i*buttonDistance), 225 * dispCargo[i][0],5)
        noFill()
        stroke(themePrimary)
        strokeWeight(1)
        line(xOffset + 45, yOffset + 90 + (i*buttonDistance),
            xOffset + 45, yOffset + 115 + (i*buttonDistance))
        line(xOffset + 45, yOffset + 110 + (i*buttonDistance),
            xOffset + 270, yOffset + 110 + (i*buttonDistance))
            noStroke()
            fill(themePrimary)
            textAlign(LEFT,CENTER)
            textSize(10)
            text(cargo[i][0],xOffset + 50, yOffset + 90 + (i*buttonDistance),220, 25)
            textSize(15)
            textAlign(CENTER,CENTER)
            text(cargo[i][1]??"",xOffset + 20, yOffset + 90 + (i*buttonDistance),25, 30)
    }

    noFill()
    stroke(themePrimary)
    strokeWeight(1)
    
    rect(xOffset + 275, yOffset + 90, 25, 25)
    rect(xOffset + 275, yOffset + 120, 25, (buttonDistance * (cargoButtons - 2)) - 5)
    rect(xOffset + 275, yOffset + 90 + (buttonDistance * (cargoButtons - 1)), 25, 25)
    
    textAlign(CENTER,CENTER)
    textSize(20)
    noStroke()
    fill(themePrimary)
    text("🡅", xOffset + 275, yOffset + 90, 25, 25)
    text("🡇", xOffset + 275, yOffset + 90 + (buttonDistance * (cargoButtons - 1)), 25, 25)
    
    strokeWeight(2)
    stroke(255,0,0)
    noFill()
    rect(xOffset + 20, yOffset + 95 + (cargoButtons * buttonDistance), 135, 40)
    stroke(themeSecondary)
    rect(xOffset + 165, yOffset + 95 + (cargoButtons * buttonDistance), 135, 40)
    
    noStroke()
    fill(255,0,0)
    textAlign(CENTER, CENTER)
    textSize(30)
    text("eject",xOffset + 20, yOffset + 95 + (cargoButtons * buttonDistance), 135, 40)
    fill(themeSecondary)
    text("use",xOffset + 165, yOffset + 95 + (cargoButtons * buttonDistance), 135, 40)
    
    textAlign(LEFT,TOP)
    fill(themePrimary)
    textSize(15)
    let weight = "n/a"
    if(!(cargo[escargo][0]=="EMPTY")) weight = getCommodity(cargo[escargo][0])[4]
    let amount = "n/a"
    if(!(cargo[escargo][0]=="EMPTY")) amount = cargo[escargo][1]
    text("item name: "+cargo[escargo][0]
    +"\nweight per item: "+weight
    +"\ntotal amount on ship: "+amount
    , xOffset + 20, yOffset + 150 + (cargoButtons * buttonDistance))
    
    

}