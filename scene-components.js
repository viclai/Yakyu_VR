/****************************************************************************
 * Code adopted from
 * "UCLA's Graphics Example Code (Javascript and C++ translations available),
 * by Garett Ridge for CS174a"
 *
 * The Scene_Component subclasses defined here describe different independent 
 * animation processes that you want to fire off each frame, by defining a 
 * display event and how to react to key and mouse input events. Create your 
 * own subclasses, and fill them in with all your shape drawing calls and any 
 * extra key / mouse controls.
 ****************************************************************************/

Declare_Any_Class("Baseball_Scene",
  {
    'construct'(context)
      {
        var shapes = {
          "box"     : new Cube(), 
          "ball"    : new Shape_From_File("resources/baseball.obj"),
          "base"    : new Base(),
          "sphere"  : new Subdivision_Sphere(5),
          "diamond" : new Quarter_Circle_Diamond()
        };
        this.submit_shapes(context, shapes);
        
        this.define_data_members({
          cork_stitch  :
            context.shaders_in_use["Phong_Model"].material(
              Color(0, 0, 0, 1), 1, 1,  0, 40,
              context.textures_in_use["stitching.jpg"]
            ),
          base         :
            context.shaders_in_use["Phong_Model"].material(
              Color(1, 1, 1, 1), .5, 1, .7, 40
            ),
          infield_dirt :
            context.shaders_in_use["Phong_Model"].material(
              Color(230/255, 204/255, 179/255, 1), .5, 1, .7, 40
            ),
          grass        :
            context.shaders_in_use["Phong_Model"].material(
              Color(0, 0, 0, 1), 1, 1, 0, 40, 
              context.textures_in_use["grass.jpg"]
            ),
        });
      },
    'display'(graphics_state)
      {
        var model_transform = identity();
        var t = graphics_state.animation_time;

        /*
         * Draws the baseball field.
         * @param {Object} oScene - The baseball scene.
         * @returns {Object[]} The transformation matrix to the surface of the
         *                     field.
         */
        var draw_field = function(oScene) {
          // TODO: Draw baseball field surface
          var tile_dimensions = {
            "length" : 2 * 150, // x
            "width"  : 2 * 150, // y
            "height" : 2 * 1    // z
          };
          var tilesX = 10;
          var tilesY = 10;
          var ground;
          var ground_center = identity();
          var surface = mult(ground_center, translation(0, 0, 1));
          var partial_sphere = mult(surface, translation(0, 300, 0));
          var infield = mult(surface, translation(0, 50, 1.0001));
          var offset;
          var tile;
          var i;

          // Draw grass
          for (i = 0; i < tile_dimensions.length * tilesX; i += tile_dimensions.length) {
            for (offset = 0; offset < tile_dimensions.width * tilesY; offset += tile_dimensions.width) {
              tile = mult(ground_center, translation(i, offset, 0));
              ground = mult(tile, scale(tile_dimensions.length / 2, tile_dimensions.length / 2, 1));
              oScene.shapes.box.draw(graphics_state, ground, oScene.grass);

              if (offset !== 0) {
                tile = mult(ground_center, translation(i, -offset, 0));
                ground = mult(tile, scale(tile_dimensions.length / 2, tile_dimensions.length / 2, 1));
                oScene.shapes.box.draw(graphics_state, ground, oScene.grass);
              }
            }

            if (i !== 0) {
              for (offset = 0; offset < tile_dimensions.width * tilesY; offset += tile_dimensions.width) {
                tile = mult(ground_center, translation(-i, offset, 0));
                ground = mult(tile, scale(tile_dimensions.length / 2, tile_dimensions.length / 2, 1));
                oScene.shapes.box.draw(graphics_state, ground, oScene.grass);

                if (offset !== 0) {
                  tile = mult(ground_center, translation(-i, -offset, 0));
                  ground = mult(tile, scale(tile_dimensions.length / 2, tile_dimensions.length / 2, 1));
                  oScene.shapes.box.draw(graphics_state, ground, oScene.grass);
                }
              }
            }
          }

          // Draw pitcher's mound
          partial_sphere = mult(partial_sphere, scale(25,25,10));
          oScene.shapes.ball.draw(graphics_state, partial_sphere, oScene.infield_dirt);

          // Draw baseball diamond
          infield = mult(infield, rotation(45, [0,0,1]));
          infield = mult(infield, scale(500, 500, 1));
          oScene.shapes.diamond.draw(graphics_state, infield, oScene.infield_dirt);
          return surface;
        };

        /*
         * Draws the baseball.
         * @param {Object} oScene - The baseball scene.
         */
        var draw_ball = function(oScene, mSurface) {
          // TODO: Draw stitching
          oScene.shapes.ball.draw(graphics_state, mult(mSurface, translation(0, 300, 10.9)), oScene.cork_stitch);
        };

        /*
         * Draws a baseball player.
         * @param {Object} oScene - The baseball scene.
         */
        var draw_player = function(oScene) {
          // TODO: Draw player

          /*
           * Draws the head of the player.
           * @param {Object} oScene - The baseball scene.
           */
          var draw_head = function() {

          };

          /*
           * Draws the body of the player.
           * @param {Object} oScene - The baseball scene.
           */
          var draw_body = function() {
            var draw_arms = function() {

            };

            var draw_hands = function() {

            };
          };

          /*
           * Draws the shoes of the player.
           * @param {Object} oScene - The baseball scene.
           */
          var draw_shoes = function() {

          };
        };

        graphics_state.lights = [
          new Light(vec4( 30,  30,  34, 1), Color(0, .4, 0, 1), 100000),
          new Light(vec4(-10, -20, -14, 0), Color(1, 1, .3, 1), 100   )
        ];
        

        model_transform = draw_field(this);
        draw_ball(this, model_transform);
      }
  }, Scene_Component);

  
// ******************************************************************
// The rest of this file is more code that powers the included demos.

// An example of a Scene_Component that our Canvas_Manager can manage.
// Displays a text user interface.
Declare_Any_Class("Debug_Screen",
  {
    'construct'(context)
      {
        this.define_data_members({
          string_map:    context.globals.string_map, start_index: 0, tick: 0, visible: false, graphics_state: new Graphics_State(),
          text_material: context.shaders_in_use["Phong_Model"].material(Color(  0, 0, 0, 1 ), 1, 0, 0, 40, context.textures_in_use["text.png"])
        });
        var shapes = {
          'debug_text': new Text_Line(35),
          'cube'      : new Cube()
        };
        this.submit_shapes( context, shapes );
      },
    'init_keys'(controls)
      {
        controls.add("t",    this, function() { this.visible ^= 1;                                                                                                  } );
        controls.add("up",   this, function() { this.start_index = ( this.start_index + 1 ) % Object.keys( this.string_map ).length;                                } );
        controls.add("down", this, function() 
                                    { this.start_index = ( this.start_index - 1   + Object.keys( this.string_map ).length ) % Object.keys( this.string_map ).length; } );
        this.controls = controls;
      },
    'update_strings'(debug_screen_object) // Strings that this Scene_Component contributes to the UI:
      {
        debug_screen_object.string_map["tick"]              = "Frame: " + this.tick++;
        debug_screen_object.string_map["text_scroll_index"] = "Text scroll index: " + this.start_index;
      },
    'display'(global_graphics_state) // Leave these 3D global matrices unused, because this class is instead making a 2D user interface.
      {
        if (!this.visible)
          return;
        var font_scale = scale( .02, .04, 1 ),
            model_transform = mult( translation( -.95, -.9, 0 ), font_scale ),
            strings = Object.keys( this.string_map );
  
        for (var i = 0, idx = this.start_index; i < 4 && i < strings.length; i++, idx = (idx + 1) % strings.length) {
          this.shapes.debug_text.set_string( this.string_map[ strings[idx] ] );
          this.shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material ); // Draw some UI text (each live-updated 
          model_transform = mult( translation( 0, .08, 0 ), model_transform );                     // logged value in each Scene_Component)
        }
        model_transform   = mult( translation( .7, .9, 0 ), font_scale);
        this.  shapes.debug_text.set_string("Controls:");
        this.  shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material); // Draw some UI text

        for (let k of Object.keys(this.controls.all_shortcuts)) {
          model_transform = mult( translation( 0, -0.08, 0 ), model_transform );
          this.shapes.debug_text.set_string( k );
          this.shapes.debug_text.draw(this.graphics_state, model_transform, this.text_material); // Draw some UI text (the canvas's key controls)
        }
      }
  }, Scene_Component);

// An example of a Scene_Component that our Canvas_Manager can manage. Adds 
// both first-person and third-person style camera matrix controls to the 
// canvas.
Declare_Any_Class("Example_Camera",                  
  {
    'construct'(context, canvas = context.canvas)
      { // 1st parameter below is our starting camera matrix. 2nd is the projection: The matrix that determines how depth is treated. It projects 3D points onto a plane.
        context.globals.graphics_state.set(
          lookAt([0, 55, 32], [0, 70, 30], [0, 0, 1]),
          perspective(45, context.width/context.height, .1, 1000),
          0
        );
        this.define_data_members({
          graphics_state : context.globals.graphics_state,
          thrust         : vec3(),
          origin         : vec3(0, 0, 0),
          looking        : false
        });

        // *** Mouse controls: ***
        this.mouse = { "from_center": vec2() }; // Measure mouse steering, for rotating the fly-around camera:
        var mouse_position = function(e) {
          return vec2(e.clientX - context.width/2, e.clientY - context.height/2);
        };   
        canvas.addEventListener("mouseup", (function(self) {
          return function(e) {
            e = e || window.event;
            self.mouse.anchor = undefined;
          }
        }) (this), false);
        canvas.addEventListener("mousedown", (function(self) {
          return function(e) {
            e = e || window.event;
            self.mouse.anchor = mouse_position(e);
          }
        }) (this), false);
        canvas.addEventListener("mousemove", (function(self) {
          return function(e) {
            e = e || window.event;
            self.mouse.from_center = mouse_position(e);
          }
        }) (this), false);
        canvas.addEventListener("mouseout", (function(self) { // Stop steering if the
          return function(e) {                                // mouse leaves the canvas.
            self.mouse.from_center = vec2();
          };
        }) (this), false);
      },
    'init_keys'(controls) // init_keys(): Define any extra keyboard shortcuts here
      {
        controls.add("Space", this, function() { this.thrust[1] = -1; });
        controls.add("Space", this, function() { this.thrust[1] =  0; }, {'type':'keyup'});
        controls.add("z",     this, function() { this.thrust[1] =  1; });
        controls.add("z",     this, function() { this.thrust[1] =  0; }, {'type':'keyup'});
        controls.add("w",     this, function() { this.thrust[2] =  1; });
        controls.add("w",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'});
        controls.add("a",     this, function() { this.thrust[0] =  1; } );
        controls.add("a",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'});
        controls.add("s",     this, function() { this.thrust[2] = -1; } );
        controls.add("s",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'});
        controls.add("d",     this, function() { this.thrust[0] = -1; } );
        controls.add("d",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'});
        //controls.add(",",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0,  1 ), this.graphics_state.camera_transform ); } );
        //controls.add(".",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0, -1 ), this.graphics_state.camera_transform ); } );
        controls.add("o",     this, function() { this.origin = mult_vec(inverse(this.graphics_state.camera_transform), vec4(0,0,0,1)).slice(0,3); });
        controls.add("r",     this, function() { this.graphics_state.camera_transform = lookAt([0, 55, 32], [0, 70, 30], [0, 0, 1]); });
        //controls.add("f",     this, function() { this.looking  ^=  1; });
      },
    'update_strings'(user_interface_string_manager) // Strings that this Scene_Component contributes to the UI:
      {
        var C_inv = inverse(this.graphics_state.camera_transform), pos = mult_vec(C_inv, vec4( 0, 0, 0, 1 )),
                                                                  z_axis = mult_vec(C_inv, vec4( 0, 0, 1, 0 ));
        user_interface_string_manager.string_map["origin" ] = "Center of rotation: " 
                                                              + this.origin[0].toFixed(0) + ", " + this.origin[1].toFixed(0) + ", " + this.origin[2].toFixed(0);
        user_interface_string_manager.string_map["cam_pos"] = "Cam Position: "
                                                              + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", " + pos[2].toFixed(2);    
        user_interface_string_manager.string_map["facing" ] = "Facing: " + ( ( z_axis[0] > 0 ? "West " : "East ") // (Actually affected by the left hand rule)
                                                               + ( z_axis[1] > 0 ? "Down " : "Up " ) + ( z_axis[2] > 0 ? "North" : "South" ) );
      },
    'display'(graphics_state)
      {
        var leeway = 70,  degrees_per_frame = .0004 * graphics_state.animation_delta_time,
                          meters_per_frame  =   .01 * graphics_state.animation_delta_time;
        if (this.mouse.anchor) {                                                     // Third-person "arcball" camera mode: Is a mouse drag occurring?
          var dragging_vector = subtract(this.mouse.from_center, this.mouse.anchor); // Spin the scene around the world origin on a user-determined axis.
          if (length(dragging_vector) > 0) {
            graphics_state.camera_transform = mult(graphics_state.camera_transform,  // Post-multiply so we rotate the scene instead of the camera.
                mult(translation( this.origin ),
                mult(rotation(.05 * length(dragging_vector), dragging_vector[1], 0, dragging_vector[0]),
                    translation(scale_vec( -1, this.origin ) ) ) ) );
          }
        }
        // First-person flyaround mode: Determine camera rotation movement when the mouse is past a minimum distance (leeway) from the canvas's center.
        var offsets = { plus:  [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ],
                        minus: [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ] };
        if (this.looking) {
          for (var i = 0; i < 2; i++) { // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
            var velocity = ( ( offsets.minus[i] > 0 && offsets.minus[i] ) || ( offsets.plus[i] < 0 && offsets.plus[i] ) ) * degrees_per_frame;  // &&'s might zero these out.
            graphics_state.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), graphics_state.camera_transform );   // On X step, rotate around Y axis, and vice versa.
          }
        }
        // Now apply translation movement of the camera, in the newest local coordinate frame
        graphics_state.camera_transform = mult(translation(scale_vec(meters_per_frame, this.thrust)), graphics_state.camera_transform);
      }
  }, Scene_Component);

// A class that just interacts with the keyboard and reports strings
Declare_Any_Class("Flag_Toggler",
  {
    'construct'(context)
      {
        this.globals    = context.globals;
      },
    'init_keys'(controls) //  Desired keyboard shortcuts
      {
        controls.add( "ALT+g", this, function() { this.globals.graphics_state.gouraud       ^= 1; } ); // Make the keyboard toggle some
        controls.add( "ALT+n", this, function() { this.globals.graphics_state.color_normals ^= 1; } ); // GPU flags on and off.
        controls.add( "ALT+a", this, function() { this.globals.animate                      ^= 1; } );
      },
    'update_strings'(user_interface_string_manager) // Strings that this Scene_Component contributes to the UI:
      {
        user_interface_string_manager.string_map["time"]    = "Animation Time: " + Math.round( this.globals.graphics_state.animation_time )/1000 + "s";
        user_interface_string_manager.string_map["animate"] = "Animation " + (this.globals.animate ? "on" : "off") ;
      },
  }, Scene_Component);
