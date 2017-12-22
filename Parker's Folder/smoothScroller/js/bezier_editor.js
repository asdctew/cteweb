$(function(){
   $('#bezier_editor').append('<svg id="canvas" style="position:fixed;width:300;height:300;background-color:blue;opacity:.1;margin-left:40%;"></svg>')
   $('#bezier_editor').append('<svg id="bezeditbutton" style="position:fixed;width:20;height:20;"><circle cx="10" cy="10" r="5" fill="red"></circle></svg>')
   $('#bezeditbutton').on('click',function(){ //toggle bez editor
      $('#canvas').toggle();
   });

   //build up canvas now
   

});
