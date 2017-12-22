$(function(){
   console.log("This is the smooth scroller! by, Parker! Nilson :o)");
   window.scrollTo(0,0);

   var scrollContainers = $('.scroll_container');

   //assign each scroll container a static page y coordinate
   for(var i = 0; i < scrollContainers.length; ++i){
      scrollContainers[i].y = scrollContainers[i].getBoundingClientRect().y;
      console.log(scrollContainers[i].y);
   }
   var focus = new function(){ //current focus point for browser
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

   var Bezier = function(p0y,p1y,p2y,p3y){
      this.p0y = p0y;
      this.p1y = p1y;
      this.p2y = p2y;
      this.p3y = p3y;

      this.getValue = function(x){
         return Math.pow(1-x, 3)*p0y + 3*x*Math.pow(1-x, 2)*p1y + 3*x*x*(1-x)*p2y + x*x*x*p3y;
      }
   }

   //scroll process object
   var ScrollProcess = function(scrollTarget){
      this.target = scrollTarget;
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
         // }else{ //if the difference between the scrollTop and scrollTarget is less than or equal to 10
         //    //stop the _tick process
         //    that.processing = false;
         // }

      }
   }

   var updateScroll = function(){
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      if(scrollTop < focus.obj.y){
         window.scrollBy(0,scrollVelocity);
         // console.log("down");
         console.log(Math.abs(scrollTop - focus.obj.y));
      }else if(scrollTop > focus.obj.y){
         window.scrollBy(0,-scrollVelocity);
         //console.log("up");
         console.log(Math.abs(scrollTop - focus.obj.y));
      }

      if(Math.abs(scrollTop - focus.obj.y) < scrollVelocity){
         //if the distance is within 5, stop the _tick process
         curScrollProcess.processing = false;
      }
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
         if(curScrollProcess == null){
            curScrollProcess = new ScrollProcess(focus.obj.y);
         }else{
            //if a scroll process already exists, give it a new target
            curScrollProcess.target = focus.obj.y;
         }

         //update curScrollProcess
         curScrollProcess.update();

         //set callback to reset cooldown
         setTimeout(function(){scrollCooldown = false;}, scrollCooldownTimer);
      }
   });
});
