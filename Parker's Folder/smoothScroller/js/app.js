var Bezier = function(p0y,p1y,p2y,p3y){
   this.p0y = p0y;
   this.p1y = p1y;
   this.p2y = p2y;
   this.p3y = p3y;

   this.getValue = function(x){
      return Math.pow(1-x, 3)*p0y + 3*x*Math.pow(1-x, 2)*p1y + 3*x*x*(1-x)*p2y + x*x*x*p3y;
   }
}

//remaps a value from range 1 to range 2
var remap = function(value, low1, high1, low2, high2){
   return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

$(function(){
   console.log("This is the smooth scroller! by, Parker! Nilson :o)");
   window.scrollTo(0,0);

   var scrollContainers = $('.scroll_container');

   //assign each scroll container a static page y coordinate
   //and bezier To value
   for(var i = 0; i < scrollContainers.length; ++i){
      scrollContainers[i].y = scrollContainers[i].getBoundingClientRect().y;

      //retrieve data attribute bez to
      var bezHash = scrollContainers[i].getAttribute("data-bez-to");
      var bezPairs = bezHash.split("#"); //split into coordinate pairs
      var yValues = [];
      for (var j = 0; j < bezPairs.length-1; ++j){ //split coordinate pairs and retain y values
         yValues[j] = bezPairs[j+1].split("_")[1];
      }
      //construct a bezier object for the scroll container to act as a bez to animator
      var bezier = new Bezier(yValues[0],yValues[1],yValues[2],yValues[3]);

      //assign the bez to bezier to the scroll container
      scrollContainers[i].bezTo = bezier;

   }

   var focus = new function(){ //object modeling the current focus point for browser
      this.obj = scrollContainers[0];
      this.index = 0;
      this.length = scrollContainers.length;
   };
   var scrollCooldownTimer = 200;
   var scrollCooldown = false;
   var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
   var scrollVelocity = 5;
   var scrollDelay = 1;
   var scrollDuration = 400; //in milliseconds
   var scrollFPS = 60; //60 frames per second
   var totalFrames = scrollFPS * (scrollDuration / 1000); // divide by 1000 to convert to seconds
   //console.log(totalFrames);
   //console.log(remap(10/60,0,1,600,800));
   var curScrollProcess; //the current scroll process responsible for centering the focus element on the page

   //scroll process object
   var ScrollProcess = function(scrollTarget, initialPos, bezier){
      this.target = scrollTarget;
      this.initialPos = initialPos;
      this.bezier = bezier;
      this.processing = false;
      this.currentFrame = 0; //current frame of the animation

      var that = this;
      this.update = function(){
         //if the focus element is not centered keep looping
         if(scrollTop != focus.obj.y){
            if(that.processing == false){
               that.processing = true;
               updateScroll();
               setTimeout(_tick, 1000/scrollFPS); //fps divided by 1000 milliseconds (or 1 second)
            }
         }
      }
   }

   var updateScroll = function(){
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

      //scroll to a remapped y value based on a bezier of the progress percent through the animation remapped to coordinates based on the initial position and the target position
      window.scrollTo(0, remap(curScrollProcess.bezier.getValue(curScrollProcess.currentFrame/totalFrames),0,1,curScrollProcess.initialPos,focus.obj.y));

      //if the animation isn't over, increment the frame
      if(curScrollProcess.currentFrame < totalFrames){
         curScrollProcess.currentFrame++;
      }else{ //end the animation
         curScrollProcess.currentFrame = 0;
         curScrollProcess.processing = false;
      }
   }

   var _tick = function(){
      if(curScrollProcess.processing == true){
         updateScroll();
         setTimeout(_tick, 1000/scrollFPS);
      }
   }

   var getCurrentScrollProcess = function(){
      return curScrollProcess;
   }

   //disable the manual scrolling of the window
   disableScroll();
   window.addEventListener('wheel', function(e){
      if(!scrollCooldown){
         scrollCooldown = true; //start cooldown
         //TODO: check if this is sufficient crossbrowser support for scrollTop
         scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

         //update focus point
         if(e.deltaY < 0 && focus.index > 0){
            focus.obj = scrollContainers[--focus.index];
            console.log("index: " + focus.index);
         }else if(e.deltaY > 0 && focus.index < scrollContainers.length - 1){
            focus.obj = scrollContainers[++focus.index];
            console.log("index: " + focus.index);
         }

         //set new scroll process with updated variables
         curScrollProcess = new ScrollProcess(focus.obj.y, scrollTop, scrollContainers[focus.index].bezTo);

         //update curScrollProcess
         curScrollProcess.update();

         //set callback to reset cooldown
         setTimeout(function(){scrollCooldown = false;}, scrollCooldownTimer);
      }
   });
});
