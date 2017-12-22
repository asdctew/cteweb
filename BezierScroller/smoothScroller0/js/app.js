var Bezier = function(p0y,p1y,p2y,p3y){
   this.p0y = p0y;
   this.p1y = p1y;
   this.p2y = p2y;
   this.p3y = p3y;

   this.getValue = function(x){
      return Math.pow(1-x, 3)*p0y + 3*x*Math.pow(1-x, 2)*p1y + 3*x*x*(1-x)*p2y + x*x*x*p3y;
   }
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
         console.log(j);
         yValues[j] = bezPairs[j+1].split("_")[1];
      }
      //construct a bezier object for the scroll container to act as a bez to animator
      var bezier = new Bezier(yValues[0],yValues[1],yValues[2],yValues[3]);

      //assign the bez to bezier to the scroll container
      scrollContainers[i].bezTo = bezier;

      console.log(scrollContainers[i].y);
      console.log(scrollContainers[i].bezTo);
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
   var curScrollProcess; //the current scroll process responsible for centering the focus element on the page



   //scroll process object
   var ScrollProcess = function(scrollTarget, initialPos, bezier){
      this.target = scrollTarget;
      this.initialPos = initialPos;
      this.bezier = bezier;
      this.processing = false;
      var that = this;
      this.update = function(){
         //if the focus element is not centered keep looping
         if(scrollTop != focus.obj.y){
            if(that.processing == false){
               that.processing = true;
               updateScroll();
               setTimeout(_tick, scrollDelay);
            }
         }
      }
   }

   var updateScroll = function(){
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

      //TODO: bezier controlled position with x = difference in position relative to target
      //TODO: map function to map scrollTop to position between original position and target position

   }

   var _tick = function(){
      if(curScrollProcess.processing == true){
         updateScroll();
         setTimeout(_tick, scrollDelay);
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

         //if no current scroll process, set a current scroll process
         //target, original scroll position, bezier
         if(curScrollProcess == null){
            curScrollProcess = new ScrollProcess(focus.obj.y, scrollTop, scrollContainers[focus.index].bezTo);
         }else{
            //if a scroll process already exists, give it a new target
            curScrollProcess.target = focus.obj.y;
            curScrollProcess.initialPos = scrollTop;
            curScrollProcess.bezier = scrollContainers[focus.index].bezTo;
         }

         //update curScrollProcess
         curScrollProcess.update();

         //set callback to reset cooldown
         setTimeout(function(){scrollCooldown = false;}, scrollCooldownTimer);
      }
   });
});
