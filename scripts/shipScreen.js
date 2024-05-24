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
    
    if(!buttonsLoaded){
      clearButtons();
      // newButton(name,displayText,textsize,X,Y,W,H,Col1,Col2,ColP1,ColP2,bWidth,func,alx,aly)
      
      
      
      buttonsLoaded = true;
    }
    
    textSize(30)
    noStroke()
    fill(themePrimary)
    text("ship management", xOffset + 20, yOffset + 20)
    
    textSize(20)
    text("cargo", xOffset + 20, yOffset + 60)
    text("ship", xOffset + 350, yOffset + 60)
    
    // blocking out UI
    
    noFill()
    stroke(themePrimary)
    strokeWeight(1)
    
    let cargoButtons = 8
    let buttonDistance = 30
    for(let i = 0; i < cargoButtons; i++){
      rect(xOffset + 20, yOffset + 90 + (i*buttonDistance),
          250, 25)
      line(xOffset + 45, yOffset + 90 + (i*buttonDistance),
          xOffset + 45, yOffset + 115 + (i*buttonDistance))
      line(xOffset + 45, yOffset + 110 + (i*buttonDistance),
          xOffset + 270, yOffset + 110 + (i*buttonDistance))
    }
    
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
    text("item name:\nweight per item:\ntotal amount on ship:", xOffset + 20, yOffset + 150 + (cargoButtons * buttonDistance))
    
    

}