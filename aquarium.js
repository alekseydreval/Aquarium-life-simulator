

var Fish = function(paramsObj) {

	this.dom = document.createElement('div');

	var paramsObj = paramsObj || {},
	    fish_style = this.dom.style;
 
    this.kill_count = 0;

    this.fish_size = paramsObj.fish_size || getRandomInt(1,5)
	fish_style.backgroundColor = this.color = paramsObj.color || ['#B02B2C', '#6BBA70'][getRandomInt(0,1)]  //'#B02B2C' - red, '#6BBA70' - green
	fish_style.width = fish_style.height = this.realPixelSize = this.fish_size * 10;
	fish_style.left = this.xCoord = getRandomInt(0, paramsObj.width - 100)
	fish_style.top = this.yCoord = getRandomInt(0, paramsObj.height - 100)

	this.dom.setAttribute('class', 'fish');
	document.getElementById('aquarium').appendChild(this.dom)

    this.dom.size = paramsObj.size || getRandomInt(1,5)

}

Fish.prototype.animate_fish = function(paramsObj) {
	var that   = this;

	var xDirection = [1,-1][getRandomInt(0,1)],
	    yDirection = [1,-1][getRandomInt(0,1)],
	    xCoeff = [1,2,3][getRandomInt(0,2)],
	    yCoeff = [1,2,3][getRandomInt(0,2)]


	var fish_frame = setInterval(function(){

	  that.xCoord += xDirection * xCoeff;
	  that.yCoord += yDirection * yCoeff;
      that.dom.style.left = that.xCoord + 'px';
      that.dom.style.top = that.yCoord + 'px';

      wallColl(that.xCoord, that.yCoord)

	}, 1/this.fish_size)

	function wallColl(xCoord, yCoord) {
		//generating new random direction
		if(xCoord < 0 || xCoord + (that.realPixelSize) > Aquarium.instance.width)
		{
			xDirection *= -1;
			yDirection = [1,-1][getRandomInt(0,1)];
		}
		else if (yCoord < 0 || yCoord + (that.realPixelSize) > Aquarium.instance.height)
		{
			yDirection *= -1;
			xDirection = [1,-1][getRandomInt(0,1)];
		}
	}

}

Fish.prototype.fish_collision = function(other_fishes) {
	var XColl = YColl = false,
	    other_fishes_length = other_fishes.length;

	for(var i = 0; i < other_fishes_length; i++)
	{

	  if ((this.xCoord + this.realPixelSize >= other_fishes[i].xCoord) && (this.xCoord <= other_fishes[i].xCoord + other_fishes[i].realPixelSize)) XColl = true;
	  if ((this.yCoord + this.realPixelSize >= other_fishes[i].yCoord) && (this.yCoord <= other_fishes[i].yCoord + other_fishes[i].realPixelSize)) YColl = true;

	  if (XColl&YColl)
	  {
	  	
	  	console.log('Collision!')
	  
        if((this.color === '#B02B2C' & other_fishes[i].color === '#6BBA70') || // if this is red and another is green
           ((this.fish_size > other_fishes[i].fish_size) & this.color != '#6BBA70')) //if another fish is smaller than this and this is not green
        {
	  	      other_fishes[i].remove();
              this.kill_count+=1;
              this.increaseColor();
              var add_fish = Aquarium.instance.addFish.bind(Aquarium.instance, {color : other_fishes[i].color})
              setTimeout(add_fish, 10000) //10 seconds timeout before new fish added
              if(this.dom.style.backgroundColor == 'rgb(0, 0, 0)')
              	this.remove();
        }
	  }
	  	XColl = YColl = false;
	}
};


Fish.prototype.remove = function() {
    
    //Preventing 2 elements from removing each other
	if(this.removed != true)
	  	{
			this.removed = true;
			var el = this.dom;
			el.parentNode.removeChild(el);
			delete this.xCoord;
			delete this.yCoord;
			delete this.pixelSize;
			remove_dead_fishes();
	  	}

  	function remove_dead_fishes() {
  		var orig_fish_list = Aquarium.instance.fish_list
  		for(var i =0; i< orig_fish_list.length; i++)
  			if(orig_fish_list[i].removed === true)
  				orig_fish_list.splice(i, 1)

  			console.log('Count of fish objects: ' + orig_fish_list.length)
  			console.log('Count of DOM fishes: ' + document.getElementById('aquarium').children.length)
  		}

};

//Hunter fish achievment
Fish.prototype.increaseColor = function() {
	var coeff = this.kill_count,
        new_red_color = 255 - (coeff * 20);

    this.dom.style.backgroundColor="rgb(" + new_red_color + ", 0, 0)"
};


var Aquarium = function(paramsObj) {

    //Singleton pattern
	if (typeof Aquarium.instance === "object") {
      return Aquarium.instance;
    }

	var paramsObj = paramsObj || {};
	this.width = paramsObj.width || 800;
	this.height = paramsObj.height || 600;

    Aquarium.instance = this;
    Aquarium.instance.fish_list = []

	// create Aquarium DOM 
    var new_dom_aq = document.createElement('div');
    new_dom_aq.setAttribute('id', 'aquarium');
    new_dom_aq.style.width = this.width;
    new_dom_aq.style.height = this.height;
    document.getElementById('wrapper').appendChild(new_dom_aq);

}


Aquarium.startCollisionWatcher = function() {

    var orig_fish_list = Aquarium.instance.fish_list,
        other_fishes = orig_fish_list.slice(0);//make non-deep arr copy

	setInterval(function(){
		for(var i = 0, length = orig_fish_list.length; i < length; i++)
		{
			other_fishes.splice(i, 1);
			if(typeof orig_fish_list[i] != 'undefined')
			  orig_fish_list[i].fish_collision(other_fishes)

			other_fishes = orig_fish_list.slice(0);
		}

    }, 100)

};


Aquarium.prototype.addFish = function(fishParams){

    //setting up default params
    fishParams = fishParams  || {}
    fishParams.width = Aquarium.instance.width
    fishParams.height =  Aquarium.instance.height
    
	new_fish = new Fish(fishParams);
	new_fish.animate_fish();
    
    //adding fish to global fish list
	Aquarium.instance.fish_list.push(new_fish)
	console.log(Aquarium.instance.fish_list)
    
    Aquarium.startCollisionWatcher()

	return new_fish
}



function getRandomInt(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}