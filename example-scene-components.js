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
          "box" : new Cube(), 
          "ball": new Subdivision_Sphere(5)
        };
        this.submit_shapes(context, shapes);
        
        this.define_data_members({
          white_cork   : context.shaders_in_use["Phong_Model"].material(Color(  1,  1, 1, 1 ), .2, 1, .7, 40),
          infield_dirt : context.shaders_in_use["Phong_Model"].material(Color( .5, .5, .3, 1 ), .2, 1,  1, 40)
        });
      },
    'display'( graphics_state )
      {
        var model_transform = identity();

        var draw_field = function(oScene) {
          // TODO: Draw baseball field surface
        };

        var draw_ball = function(oScene) {
          // TODO: Draw stitching
          oScene.shapes.ball.draw(graphics_state, identity(), oScene.white_cork);
        };

        var draw_player = function(oScene) {
          // TODO: Draw player
          var draw_head = function() {

          };

          var draw_body = function() {
            var draw_arms = function() {

            };

            var draw_hands = function() {

            };
          };

          var draw_shoes = function() {

          };
        };

        graphics_state.lights = [
          new Light(vec4( 30,  30,  34, 1), Color(0, .4, 0, 1), 100000),
          new Light(vec4(-10, -20, -14, 0), Color(1, 1, .3, 1), 100   )
        ];

        draw_ball(this);
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
        controls.add( "t",    this, function() { this.visible ^= 1;                                                                                                  } );
        controls.add( "up",   this, function() { this.start_index = ( this.start_index + 1 ) % Object.keys( this.string_map ).length;                                } );
        controls.add( "down", this, function() 
                                    { this.start_index = ( this.start_index - 1   + Object.keys( this.string_map ).length ) % Object.keys( this.string_map ).length; } );
        this.controls = controls;
      },
    'update_strings'(debug_screen_object) // Strings that this Scene_Component contributes to the UI:
      { debug_screen_object.string_map["tick"]              = "Frame: " + this.tick++;
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
      { // 1st parameter below is our starting camera matrix.  2nd is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
        context.globals.graphics_state.set( translation(0, 0,-25), perspective(45, context.width/context.height, .1, 1000), 0 );
        this.define_data_members( { graphics_state: context.globals.graphics_state, thrust: vec3(), origin: vec3( 0, 5, 0 ), looking: false } );

        // *** Mouse controls: ***
        this.mouse = { "from_center": vec2() };                           // Measure mouse steering, for rotating the flyaround camera:
        var mouse_position = function( e ) { return vec2( e.clientX - context.width/2, e.clientY - context.height/2 ); };   
        canvas.addEventListener( "mouseup",   ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = undefined;              } } ) (this), false );
        canvas.addEventListener( "mousedown", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
        canvas.addEventListener( "mousemove", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );
        canvas.addEventListener( "mouseout",  ( function(self) { return function(e) { self.mouse.from_center = vec2(); }; } ) (this), false );  // Stop steering if the 
      },                                                                                                                                        // mouse leaves the canvas.
    'init_keys'(controls) // init_keys():  Define any extra keyboard shortcuts here
      { controls.add( "Space", this, function() { this.thrust[1] = -1; } );     controls.add( "Space", this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "z",     this, function() { this.thrust[1] =  1; } );     controls.add( "z",     this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "w",     this, function() { this.thrust[2] =  1; } );     controls.add( "w",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "a",     this, function() { this.thrust[0] =  1; } );     controls.add( "a",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( "s",     this, function() { this.thrust[2] = -1; } );     controls.add( "s",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "d",     this, function() { this.thrust[0] = -1; } );     controls.add( "d",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( ",",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0,  1 ), this.graphics_state.camera_transform ); } );
        controls.add( ".",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0, -1 ), this.graphics_state.camera_transform ); } );
        controls.add( "o",     this, function() { this.origin = mult_vec( inverse( this.graphics_state.camera_transform ), vec4(0,0,0,1) ).slice(0,3)         ; } );
        controls.add( "r",     this, function() { this.graphics_state.camera_transform = identity()                                                           ; } );
        controls.add( "f",     this, function() { this.looking  ^=  1; } );
      },
    'update_strings'(user_interface_string_manager) // Strings that this Scene_Component contributes to the UI:
      {
        var C_inv = inverse(this.graphics_state.camera_transform), pos = mult_vec(C_inv, vec4( 0, 0, 0, 1 )),
                                                                  z_axis = mult_vec(C_inv, vec4( 0, 0, 1, 0 ));
        user_interface_string_manager.string_map["origin" ] = "Center of rotation: " 
                                                              + this.origin[0].toFixed(0) + ", " + this.origin[1].toFixed(0) + ", " + this.origin[2].toFixed(0);
        user_interface_string_manager.string_map["cam_pos"] = "Cam Position: "
                                                              + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", " + pos[2].toFixed(2);    
        user_interface_string_manager.string_map["facing" ] = "Facing: " + ( ( z_axis[0] > 0 ? "West " : "East ")             // (Actually affected by the left hand rule)
                                                               + ( z_axis[1] > 0 ? "Down " : "Up " ) + ( z_axis[2] > 0 ? "North" : "South" ) );
      },
    'display'(graphics_state)
      {
        var leeway = 70,  degrees_per_frame = .0004 * graphics_state.animation_delta_time,
                          meters_per_frame  =   .01 * graphics_state.animation_delta_time;
        if (this.mouse.anchor) {                                                       // Third-person "arcball" camera mode: Is a mouse drag occurring?
          var dragging_vector = subtract( this.mouse.from_center, this.mouse.anchor ); // Spin the scene around the world origin on a user-determined axis.
          if( length( dragging_vector ) > 0 )
            graphics_state.camera_transform = mult( graphics_state.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
                mult( translation( this.origin ),
                mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ),
                      translation(scale_vec( -1, this.origin ) ) ) ) );
        }
        // First-person flyaround mode:  Determine camera rotation movement when the mouse is past a minimum distance (leeway) from the canvas's center.
        var offsets = { plus:  [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ],
                        minus: [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ] };
        if( this.looking ) 
          for( var i = 0; i < 2; i++ )      // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
          {
            var velocity = ( ( offsets.minus[i] > 0 && offsets.minus[i] ) || ( offsets.plus[i] < 0 && offsets.plus[i] ) ) * degrees_per_frame;  // &&'s might zero these out.
            graphics_state.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), graphics_state.camera_transform );   // On X step, rotate around Y axis, and vice versa.
          }     // Now apply translation movement of the camera, in the newest local coordinate frame
        graphics_state.camera_transform = mult( translation( scale_vec( meters_per_frame, this.thrust ) ), graphics_state.camera_transform );
      }
  }, Scene_Component);

Declare_Any_Class("Flag_Toggler", // A class that just interacts with the keyboard and reports strings
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
  
Declare_Any_Class("Surfaces_Tester",
  {
    'construct'(context)
      {
        context.globals.animate = true;
        var shapes = {
          'good_sphere' : new Subdivision_Sphere(4),
          'box'         : new Cube(),
          'strip'       : new Square(),
          'septagon'    : new Regular_2D_Polygon( 2,  7),
          'tube'        : new Cylindrical_Tube  (10, 10),
          'open_cone'   : new Cone_Tip          ( 3, 10),
          'donut'       : new Torus             (15, 15),
          'bad_sphere'  : new Grid_Sphere       (10, 10),
          'cone'        : new Closed_Cone       (10, 10),
          'capped'      : new Capped_Cylinder   ( 4, 12),
          'axis'        : new Axis_Arrows(),
          'prism'       :     Capped_Cylinder   .prototype.auto_flat_shaded_version(10, 10),
          'gem'         :     Subdivision_Sphere.prototype.auto_flat_shaded_version( 2    ),
          'gem2'        :     Torus             .prototype.auto_flat_shaded_version(20, 20),
          'swept_curve' : new Surface_Of_Revolution(10, 10, 
                            [vec3(2, 0, -1), vec3(1, 0, 0), vec3(1, 0, 1), vec3(0, 0, 2)], 120, [[0, 7] [0, 7]]) 
        };
        this.submit_shapes(context, shapes);
        this.define_data_members({
          shader: context.shaders_in_use["Phong_Model"],
          textures: Object.values(context.textures_in_use)
        });
      },
    'draw_all_shapes'(model_transform, graphics_state)
      {
        var i = 0, t = graphics_state.animation_time / 1000;
        
        for (key in this.shapes) {
          i++;
          var funny_function_of_time = 50*t + i*i*Math.cos( t/2 ),
              random_material        = this.shader.material( Color( (i % 7)/7, (i % 6)/6, (i % 5)/5, 1 ), .2, 1, 1, 40, this.textures[ i % this.textures.length ] )
              
          model_transform = mult( model_transform, rotation( funny_function_of_time, i%3 == 0, i%3 == 1, i%3 == 2 ) ); // Irregular motion
          model_transform = mult( model_transform, translation( 0, -3, 0 ) );
          this.shapes[key].draw( graphics_state, model_transform, random_material ); // Draw the current shape in the list		
        }
        return model_transform;     
      },
    'display'(graphics_state)
      {
        var model_transform = identity(); 
        for (var i = 0; i < 7; i++) { // Another example of not every shape owning the same pair of lights:
        
          graphics_state.lights = [ new Light( vec4( i % 7 - 3, i % 6 - 3, i % 5 - 3, 1 ), Color( 1, 0, 0, 1 ), 100000000 ),
                                    new Light( vec4( i % 6 - 3, i % 5 - 3, i % 7 - 3, 1 ), Color( 0, 1, 0, 1 ), 100000000 ) ];
        
          model_transform = this.draw_all_shapes( model_transform, graphics_state ); // *** How to call a function and still have a single matrix state ***
          model_transform = mult( model_transform, rotation( 360 / 13, 0, 0, 1 ) );
        }
      }
  }, Scene_Component);
  
  
// DISCLAIMER: The collision method shown below is not used by anyone; it's 
// just very quick to code. Making every collision body a stretched sphere is 
// kind of a hack, and looping through a list of discrete sphere points to see
// if the volumes intersect is *really* a hack (there are perfectly good 
// analytic expressions that can test if two ellipsoids intersect without 
// discretizing them into points). On the other hand, for non-convex shapes 
// you're usually going to have to loop through a list of discrete tetrahedrons
// defining the shape anyway.
Declare_Any_Class("Body",
  {
    'construct'(s, m)
      {
        this.randomize(s, m);
      },
    'randomize'(s, m)
      {
        this.define_data_members({
          shape: s,
          scale: [1, 1+Math.random(), 1],
          location_matrix: mult( rotation( 360 * Math.random(), random_vec3(1) ), translation( random_vec3(10) ) ), 
          linear_velocity: random_vec3(.1), 
          angular_velocity: .5*Math.random(), spin_axis: random_vec3(1),
          material: m
        });
      },
    'advance'(b, time_amount) // Do one timestep.
      {
        var delta = translation( scale_vec( time_amount, b.linear_velocity)); // Move proportionally to real time.
        b.location_matrix = mult(delta, b.location_matrix);                   // Apply translation velocity - pre-multiply to keep translations together
        
        delta = rotation(time_amount * b.angular_velocity, b.spin_axis);      // Move proportionally to real time.
        b.location_matrix = mult(b.location_matrix, delta);                   // Apply angular velocity - post-multiply to keep rotations together    
      },
    'check_if_colliding'(b, a_inv, shape) // Collision detection function
      {
        if (this == b) // Nothing collides with itself
          return false;
        var T = mult(a_inv, mult( b.location_matrix, scale(b.scale)));  // Convert sphere b to a coordinate frame where a is a unit sphere
        for (let p of shape.positions) { // For each vertex in that b, apply a_inv*b coordinate frame shift
          var Tp = mult_vec( T, p.concat(1) ).slice(0,3);               
          if (dot(Tp, Tp) < 1.2) // Check if in that coordinate frame it penetrates the unit sphere at the origin.
            return true;
        }
        return false;
      }
  });
