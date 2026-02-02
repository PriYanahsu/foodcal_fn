import { Exercise } from './types';

export const EXERCISES: Exercise[] = [
    // --- CHEST ---
    // Beginner
    {
        id: 'wall-push-ups',
        name: 'Wall Push-ups',
        muscleGroup: 'chest',
        description: 'A beginner-friendly push-up variation performed against a wall to build base strength.',
        difficulty: 'beginner',
        equipment: ['Wall'],
        steps: ['Stand at arm\'s length from a wall.', 'Place hands on the wall at shoulder height.', 'Lower your chest toward the wall.', 'Push back to start.']
    },
    {
        id: 'knee-push-ups',
        name: 'Knee Push-ups',
        muscleGroup: 'chest',
        description: 'Modified push-up to reduce body weight resistance.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Start in plank but with knees on the floor.', 'Lower chest to the ground.', 'Push back up.']
    },
    {
        id: 'incline-push-ups',
        name: 'Incline Push-ups',
        muscleGroup: 'chest',
        description: 'Push-ups with hands on an elevated surface.',
        difficulty: 'beginner',
        equipment: ['Bench or Step'],
        steps: ['Place hands on a bench.', 'Perform a standard push-up motion.', 'Focus on keeping a straight line.']
    },
    {
        id: 'resistance-band-chest-press',
        name: 'Resistance Band Chest Press',
        muscleGroup: 'chest',
        description: 'Using bands for consistent tension across the chest.',
        difficulty: 'beginner',
        equipment: ['Resistance Band'],
        steps: ['Wrap band around a pole or your back.', 'Press handles forward until arms are straight.', 'Return slowly.']
    },
    {
        id: 'machine-chest-press',
        name: 'Machine Chest Press',
        muscleGroup: 'chest',
        description: 'Stable pressing movement for isolation.',
        difficulty: 'beginner',
        equipment: ['Chest Press Machine'],
        steps: ['Adjust seat height.', 'Push handles forward.', 'Control the weight on the way back.']
    },
    {
        id: 'chest-fly-machine',
        name: 'Chest Fly Machine',
        muscleGroup: 'chest',
        description: 'Isolates pectorals using a machine.',
        difficulty: 'beginner',
        equipment: ['Pec Deck / Fly Machine'],
        steps: ['Sit and grip the handles.', 'Bring them together in front of you.', 'Squeeze and return.']
    },
    {
        id: 'dumbbell-floor-press',
        name: 'Dumbbell Floor Press',
        muscleGroup: 'chest',
        description: 'Safe alternative to bench press that limits range of motion.',
        difficulty: 'beginner',
        equipment: ['Dumbbells'],
        steps: ['Lie on the floor with knees bent.', 'Press dumbbells up from the floor.', 'Stop when elbows touch the ground.']
    },
    {
        id: 'light-dumbbell-bench-press',
        name: 'Light Dumbbell Bench Press',
        muscleGroup: 'chest',
        description: 'Standard bench press with manageable weights.',
        difficulty: 'beginner',
        equipment: ['Dumbbells', 'Flat Bench'],
        steps: ['Lie on bench.', 'Press dumbbells up above chest.', 'Lower with control.']
    },
    {
        id: 'push-up-hold',
        name: 'Push-up Hold',
        muscleGroup: 'chest',
        description: 'Isometric hold to build stability and endurance.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Hold the bottom position of a push-up.', 'Keep core tight.', 'Breathe through the hold.']
    },
    {
        id: 'pec-deck-light',
        name: 'Pec Deck (Light)',
        muscleGroup: 'chest',
        description: 'Light isolation to warm up the chest muscles.',
        difficulty: 'beginner',
        equipment: ['Pec Deck Machine'],
        steps: ['Sit and bring pads together.', 'Control the stretch.']
    },

    // Intermediate
    {
        id: 'standard-push-ups',
        name: 'Standard Push-ups',
        muscleGroup: 'chest',
        description: 'The fundamental bodyweight chest exercise.',
        difficulty: 'intermediate',
        equipment: ['Bodyweight'],
        steps: ['Plank position.', 'Lower until chest nearly touches.', 'Push up.']
    },
    {
        id: 'flat-bench-press',
        name: 'Flat Bench Press',
        muscleGroup: 'chest',
        description: 'Core compound movement for chest mass.',
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Flat Bench'],
        steps: ['Unrack bar.', 'Lower to mid-chest.', 'Drive up.']
    },
    {
        id: 'incline-bench-press',
        name: 'Incline Bench Press',
        muscleGroup: 'chest',
        description: 'Focuses on the upper chest fibers.',
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Incline Bench'],
        steps: ['Bench at 30-45 degrees.', 'Press bar upward.', 'Control the descent.']
    },
    {
        id: 'dumbbell-bench-press',
        name: 'Dumbbell Bench Press',
        muscleGroup: 'chest',
        description: 'Allows for a deeper range of motion.',
        difficulty: 'intermediate',
        equipment: ['Dumbbells', 'Flat Bench'],
        steps: ['Press dumbbells independently.', 'Maintain stability.']
    },
    {
        id: 'dumbbell-fly',
        name: 'Dumbbell Fly',
        muscleGroup: 'chest',
        description: 'Stretches the pec fibers.',
        difficulty: 'intermediate',
        equipment: ['Dumbbells', 'Flat Bench'],
        steps: ['Arms in wide arc.', 'Squeeze together at top.']
    },
    {
        id: 'cable-chest-fly',
        name: 'Cable Chest Fly',
        muscleGroup: 'chest',
        description: 'Constant tension throughout the movement.',
        difficulty: 'intermediate',
        equipment: ['Cable Machine'],
        steps: ['Step forward from cables.', 'Arc hands together.', 'Focus on the stretch.']
    },
    {
        id: 'chest-dips',
        name: 'Chest Dips',
        muscleGroup: 'chest',
        description: 'Targets the lower pectorals.',
        difficulty: 'intermediate',
        equipment: ['Dip Bars'],
        steps: ['Lean forward.', 'Dip down until elbows are at 90 deg.', 'Push up.']
    },
    {
        id: 'decline-push-ups',
        name: 'Decline Push-ups',
        muscleGroup: 'chest',
        description: 'Push-ups with feet elevated to target upper chest.',
        difficulty: 'intermediate',
        equipment: ['Bench / Elevated surface'],
        steps: ['Feet on bench.', 'Hands on floor.', 'Lower chest.']
    },
    {
        id: 'smith-machine-bench',
        name: 'Smith Machine Bench',
        muscleGroup: 'chest',
        description: 'Fixed path pressing for safety and focus.',
        difficulty: 'intermediate',
        equipment: ['Smith Machine'],
        steps: ['Align bar to mid-chest.', 'Press and lower.']
    },
    {
        id: 'pause-bench-press',
        name: 'Pause Bench Press',
        muscleGroup: 'chest',
        description: 'Building power from the chest by pausing at the bottom.',
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Flat Bench'],
        steps: ['Lower bar to chest.', 'Hold for 1-2 seconds.', 'Explode up.']
    },

    // Advanced
    {
        id: 'heavy-barbell-bench-press',
        name: 'Barbell Bench Press (Heavy)',
        muscleGroup: 'chest',
        description: 'Max strength development for the chest.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Flat Bench'],
        steps: ['Tight setup.', 'Big breath.', 'Control heavy load.', 'Max effort drive.']
    },
    {
        id: 'incline-barbell-press-adv',
        name: 'Incline Barbell Press',
        muscleGroup: 'chest',
        description: 'Heavy upper chest focus.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Incline Bench'],
        steps: ['Targeting top pec fibers.', 'Controlled descent.']
    },
    {
        id: 'decline-bench-press',
        name: 'Decline Bench Press',
        muscleGroup: 'chest',
        description: 'Maximizing lower chest power.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Decline Bench'],
        steps: ['Lock legs in.', 'Press with heavy weight.']
    },
    {
        id: 'weighted-dips',
        name: 'Weighted Dips',
        muscleGroup: 'chest',
        description: 'Dips with added weight for maximal overload.',
        difficulty: 'advanced',
        equipment: ['Dip Belt / Dumbbell', 'Dip Bars'],
        steps: ['Attach weight.', 'Perform dips with full ROM.']
    },
    {
        id: 'dumbbell-pullover',
        name: 'Dumbbell Pullover',
        muscleGroup: 'chest',
        description: 'Targets chest and lats through a deep stretch.',
        difficulty: 'advanced',
        equipment: ['Dumbbell', 'Flat Bench'],
        steps: ['Lie across bench.', 'Lower weight behind head.', 'Pull back over chest.']
    },
    {
        id: 'one-arm-push-ups',
        name: 'One-arm Push-ups',
        muscleGroup: 'chest',
        description: 'Elite bodyweight strength feat.',
        difficulty: 'advanced',
        equipment: ['Bodyweight'],
        steps: ['Legs wide.', 'One hand behind back.', 'Lower and press.']
    },
    {
        id: 'plyometric-push-ups',
        name: 'Plyometric Push-ups',
        muscleGroup: 'chest',
        description: 'Developing explosive power.',
        difficulty: 'advanced',
        equipment: ['Bodyweight'],
        steps: ['Push up with enough force to lift hands off floor.', 'Land softly.']
    },
    {
        id: 'spoto-press',
        name: 'Spoto Press',
        muscleGroup: 'chest',
        description: 'Bench press variation where weight is paused an inch above chest.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Flat Bench'],
        steps: ['Stop just above chest.', 'Hold briefly.', 'Drive up.']
    },
    {
        id: 'cable-crossover-heavy',
        name: 'Cable Crossover (Heavy)',
        muscleGroup: 'chest',
        description: 'High tension isolation for mass.',
        difficulty: 'advanced',
        equipment: ['Cable Machine'],
        steps: ['Heavy stack.', 'Squeeze handles together.']
    },
    {
        id: 'tempo-bench-press',
        name: 'Tempo Bench Press',
        muscleGroup: 'chest',
        description: 'Focusing on time under tension during the bench press.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Flat Bench'],
        steps: ['3-sec down.', '1-sec pause.', 'Max speed up.']
    },

    // --- BACK ---
    // Beginner
    {
        id: 'assisted-pull-ups',
        name: 'Assisted Pull-ups',
        muscleGroup: 'back',
        description: 'Building pull-up strength with machine or band assistance.',
        difficulty: 'beginner',
        equipment: ['Pull-up Machine / Band'],
        steps: ['Place knees on pad.', 'Pull chin over bar.', 'Control descent.']
    },
    {
        id: 'lat-pulldown-db',
        name: 'Lat Pulldown',
        muscleGroup: 'back',
        description: 'Stable machine-based move for back width.',
        difficulty: 'beginner',
        equipment: ['Lat Pulldown Machine'],
        steps: ['Pull bar to upper chest.', 'Focus on lats.']
    },
    {
        id: 'seated-cable-row',
        name: 'Seated Cable Row',
        muscleGroup: 'back',
        description: 'Targets mid-back and posture.',
        difficulty: 'beginner',
        equipment: ['Cable Machine'],
        steps: ['Pull handle to stomach.', 'Squeeze shoulder blades.']
    },
    {
        id: 'resistance-band-rows',
        name: 'Resistance Band Rows',
        muscleGroup: 'back',
        description: 'Easy-to-access rowing movement.',
        difficulty: 'beginner',
        equipment: ['Resistance Band'],
        steps: ['Pull band toward hips.', 'Squeeze back.']
    },
    {
        id: 'machine-row',
        name: 'Machine Row',
        muscleGroup: 'back',
        description: 'Guided rowing for isolation.',
        difficulty: 'beginner',
        equipment: ['Rowing Machine'],
        steps: ['Pull handles back.', 'Keep chest on pad.']
    },
    {
        id: 'straight-arm-pulldown',
        name: 'Straight Arm Pulldown',
        muscleGroup: 'back',
        description: 'Isolates the lats without bicep involvement.',
        difficulty: 'beginner',
        equipment: ['Cable Machine'],
        steps: ['Keep arms straight.', 'Pull bar to thighs.']
    },
    {
        id: 'dumbbell-row-light',
        name: 'Dumbbell Row (Light)',
        muscleGroup: 'back',
        description: 'Unilateral back training.',
        difficulty: 'beginner',
        equipment: ['Dumbbells'],
        steps: ['One knee on bench.', 'Row weight to hip.']
    },
    {
        id: 'back-extension',
        name: 'Back Extension',
        muscleGroup: 'back',
        description: 'Targets the lower back spinal erectors.',
        difficulty: 'beginner',
        equipment: ['Back Extension Bench'],
        steps: ['Hinge at hips.', 'Lift torso until straight.']
    },
    {
        id: 'inverted-rows-knees',
        name: 'Inverted Rows (Bent knees)',
        muscleGroup: 'back',
        description: 'Modified pull-up preparation.',
        difficulty: 'beginner',
        equipment: ['Low Bar / Smith Machine'],
        steps: ['Knees bent.', 'Pull chest to bar.']
    },
    {
        id: 'scapular-pull-ups',
        name: 'Scapular Pull-ups',
        muscleGroup: 'back',
        description: 'Engaging the back muscles without a full pull-up.',
        difficulty: 'beginner',
        equipment: ['Pull-up Bar'],
        steps: ['Dead hang.', 'Pull shoulder blades down.', 'Release.']
    },

    // Intermediate
    {
        id: 'pull-ups',
        name: 'Pull-ups',
        muscleGroup: 'back',
        description: 'The ultimate bodyweight test for lats.',
        difficulty: 'intermediate',
        equipment: ['Pull-up Bar'],
        steps: ['Hanging position.', 'Pull until chin clears bar.', 'Slowly lower.']
    },
    {
        id: 'chin-ups',
        name: 'Chin-ups',
        muscleGroup: 'back',
        description: 'Pull-ups with palms facing you, more bicep help.',
        difficulty: 'intermediate',
        equipment: ['Pull-up Bar'],
        steps: ['Underhand grip.', 'Pull to chin.']
    },
    {
        id: 'barbell-row',
        name: 'Barbell Row',
        muscleGroup: 'back',
        description: 'Mass builder for the whole back.',
        difficulty: 'intermediate',
        equipment: ['Barbell'],
        steps: ['Bend at hips.', 'Row bar to belly button.']
    },
    {
        id: 'dumbbell-row-inter',
        name: 'Dumbbell Row',
        muscleGroup: 'back',
        description: 'Focusing on single-arm strength.',
        difficulty: 'intermediate',
        equipment: ['Dumbbells'],
        steps: ['Row dumbbell to hip.', 'Stretch at bottom.']
    },
    {
        id: 't-bar-row',
        name: 'T-Bar Row',
        muscleGroup: 'back',
        description: 'Traditional heavy back exercise.',
        difficulty: 'intermediate',
        equipment: ['T-Bar Setup'],
        steps: ['Row handles to chest.', 'Controlled stretch.']
    },
    {
        id: 'close-grip-pulldown',
        name: 'Close Grip Pulldown',
        muscleGroup: 'back',
        description: 'Targets the inner lats and mid-back.',
        difficulty: 'intermediate',
        equipment: ['Cable Machine', 'V-bar'],
        steps: ['Pull V-bar to upper chest.', 'Lean slightly back.']
    },
    {
        id: 'meadows-row',
        name: 'Meadows Row',
        muscleGroup: 'back',
        description: 'Named after John Meadows, focuses on rear delts and lats.',
        difficulty: 'intermediate',
        equipment: ['Landmine Setup'],
        steps: ['Row end of bar to hip.', 'Staggered stance.']
    },
    {
        id: 'cable-row-inter',
        name: 'Cable Row',
        muscleGroup: 'back',
        description: 'Constant tension rowing.',
        difficulty: 'intermediate',
        equipment: ['Cable Machine'],
        steps: ['Seated row with various attachments.']
    },
    {
        id: 'face-pulls',
        name: 'Face Pulls',
        muscleGroup: 'back',
        description: 'Prehab for shoulders and upper back.',
        difficulty: 'intermediate',
        equipment: ['Cable Machine', 'Rope'],
        steps: ['Pull rope to forehead.', 'Pull halves apart.']
    },
    {
        id: 'hyperextensions',
        name: 'Hyperextensions',
        muscleGroup: 'back',
        description: 'Strengthens the lower back spinal erectors.',
        difficulty: 'intermediate',
        equipment: ['45 Deg Hyper Bench'],
        steps: ['Extend torso until aligned with legs.', 'Control descent.']
    },

    // Advanced
    {
        id: 'deadlift-back',
        name: 'Deadlift',
        muscleGroup: 'back',
        description: 'The ultimate back and posterior chain exercise.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Hip hinge.', 'Pull with flat back.', 'Brace core.']
    },
    {
        id: 'weighted-pull-ups',
        name: 'Weighted Pull-ups',
        muscleGroup: 'back',
        description: 'Pull-ups with progressive overload.',
        difficulty: 'advanced',
        equipment: ['Dip Belt', 'Weights'],
        steps: ['Attach weight.', 'Full ROM pull-up.']
    },
    {
        id: 'pendlay-row',
        name: 'Pendlay Row',
        muscleGroup: 'back',
        description: 'Strict barbell row from the floor each rep.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Back horizontal.', 'Explosive pull from dead stop.']
    },
    {
        id: 'rack-pulls',
        name: 'Rack Pulls',
        muscleGroup: 'back',
        description: 'Partial deadlift for massive trap and back development.',
        difficulty: 'advanced',
        equipment: ['Power Rack', 'Barbell'],
        steps: ['Bar at knee height.', 'Pull to lockout.']
    },
    {
        id: 'one-arm-barbell-row',
        name: 'One-arm Barbell Row',
        muscleGroup: 'back',
        description: 'High difficulty unilateral row.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Grip the barbell shaft.', 'Row with one arm.']
    },
    {
        id: 'snatch-grip-deadlift',
        name: 'Snatch Grip Deadlift',
        muscleGroup: 'back',
        description: 'Extra range of motion deadlift for the upper back.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Grip wide.', 'Pull with flat back.']
    },
    {
        id: 'muscle-ups',
        name: 'Muscle-ups',
        muscleGroup: 'back',
        description: 'Explosive pull transition into a dip.',
        difficulty: 'advanced',
        equipment: ['Pull-up Bar'],
        steps: ['Explosive pull.', 'Transition above bar.', 'Push up.']
    },
    {
        id: 'heavy-t-bar-row',
        name: 'Heavy T-Bar Row',
        muscleGroup: 'back',
        description: 'Max mass mid-back builder.',
        difficulty: 'advanced',
        equipment: ['T-Bar Setup'],
        steps: ['Load it up.', 'Focus on squeeze.']
    },
    {
        id: 'deficit-deadlift',
        name: 'Deficit Deadlift',
        muscleGroup: 'back',
        description: 'Standing on a platform for increased ROM.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Block/Plate'],
        steps: ['Stand on 2-inch block.', 'Standard deadlift motion.']
    },
    {
        id: 'explosive-pull-ups',
        name: 'Explosive Pull-ups',
        muscleGroup: 'back',
        description: 'Pulling with max velocity.',
        difficulty: 'advanced',
        equipment: ['Pull-up Bar'],
        steps: ['Pull fast.', 'Try to touch chest to bar.']
    },

    // --- LEGS (QUADS + HAMSTRINGS) ---
    // Beginner
    {
        id: 'bodyweight-squats',
        name: 'Bodyweight Squats',
        muscleGroup: 'quads',
        description: 'Foundational leg movement.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Feet shoulder width.', 'Squat deep.', 'Keep chest up.']
    },
    {
        id: 'leg-press-light',
        name: 'Leg Press (Light)',
        muscleGroup: 'quads',
        description: 'Guided leg press for safe training.',
        difficulty: 'beginner',
        equipment: ['Leg Press Machine'],
        steps: ['Push platform.', 'Don\'t lock knees.']
    },
    {
        id: 'walking-lunges',
        name: 'Walking Lunges',
        muscleGroup: 'quads',
        description: 'Unilateral leg and balance work.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Step forward.', 'Lower back knee almost to floor.', 'Alternate.']
    },
    {
        id: 'step-ups',
        name: 'Step-ups',
        muscleGroup: 'quads',
        description: 'Targets quads and glutes using an elevation.',
        difficulty: 'beginner',
        equipment: ['Box or Step'],
        steps: ['Step up with one foot.', 'Drive through heel.']
    },
    {
        id: 'glute-bridge-beginner',
        name: 'Glute Bridge',
        muscleGroup: 'glutes',
        description: 'Core posterior chain starter.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Lie on back.', 'Lift hips toward ceiling.']
    },
    {
        id: 'hamstring-curl-machine',
        name: 'Hamstring Curl Machine',
        muscleGroup: 'hamstrings',
        description: 'Isolates the back of the leg.',
        difficulty: 'beginner',
        equipment: ['Curl Machine'],
        steps: ['Curl pads to glutes.', 'Controlled release.']
    },
    {
        id: 'wall-sit',
        name: 'Wall Sit',
        muscleGroup: 'quads',
        description: 'Static hold for quad endurance.',
        difficulty: 'beginner',
        equipment: ['Wall'],
        steps: ['Back against wall.', 'Sit at 90 deg.', 'Hold.']
    },
    {
        id: 'goblet-squat',
        name: 'Goblet Squat',
        muscleGroup: 'quads',
        description: 'Weighted squat that helps maintain upright posture.',
        difficulty: 'beginner',
        equipment: ['Dumbbell or Kettlebell'],
        steps: ['Hold weight at chest.', 'Squat deep.']
    },
    {
        id: 'reverse-lunges',
        name: 'Reverse Lunges',
        muscleGroup: 'quads',
        description: 'Easier on knees than forward lunges.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Step back.', 'Drop knee.', 'Return.']
    },
    {
        id: 'stability-ball-curls',
        name: 'Stability Ball Curls',
        muscleGroup: 'hamstrings',
        description: 'Hamstring curls using a ball.',
        difficulty: 'beginner',
        equipment: ['Stability Ball'],
        steps: ['Heels on ball.', 'Bridge up.', 'Curl ball in.']
    },

    // Intermediate
    {
        id: 'barbell-squats',
        name: 'Barbell Squats',
        muscleGroup: 'quads',
        description: 'The foundation of all lower body training.',
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Squat Rack'],
        steps: ['Bar on traps.', 'Depth below parallel.', 'Drive up.']
    },
    {
        id: 'front-squats',
        name: 'Front Squats',
        muscleGroup: 'quads',
        description: 'More quad-dominant squat with bar in front.',
        difficulty: 'intermediate',
        equipment: ['Barbell'],
        steps: ['Bar on front delts.', 'Stay upright.', 'Squat deep.']
    },
    {
        id: 'romanian-deadlift-inter',
        name: 'Romanian Deadlift',
        muscleGroup: 'hamstrings',
        description: 'Powerful hamstring and glute exercise.',
        difficulty: 'intermediate',
        equipment: ['Barbell'],
        steps: ['Stretch hams.', 'Keep bar close.', 'Hip hinge.']
    },
    {
        id: 'bulgarian-split-squat',
        name: 'Bulgarian Split Squat',
        muscleGroup: 'quads',
        description: 'Unilateral leg burner.',
        difficulty: 'intermediate',
        equipment: ['Bench', 'Dumbbells'],
        steps: ['Rear foot on bench.', 'Squat with front leg.']
    },
    {
        id: 'hack-squat',
        name: 'Hack Squat',
        muscleGroup: 'quads',
        description: 'Machine-guided quad isolator.',
        difficulty: 'intermediate',
        equipment: ['Hack Squat Machine'],
        steps: ['Feet on platform.', 'Lower and press.']
    },
    {
        id: 'sumo-squat',
        name: 'Sumo Squat',
        muscleGroup: 'quads',
        description: 'Wide stance squat for inner thighs and glutes.',
        difficulty: 'intermediate',
        equipment: ['Dumbbell or Barbell'],
        steps: ['Wide feet.', 'Toes out.', 'Squat.']
    },
    {
        id: 'lying-hamstring-curl',
        name: 'Lying Hamstring Curl',
        muscleGroup: 'hamstrings',
        description: 'Isolating hamstrings through machines.',
        difficulty: 'intermediate',
        equipment: ['Hamstring Machine'],
        steps: ['Lie face down.', 'Curl legs.']
    },
    {
        id: 'box-squats',
        name: 'Box Squats',
        muscleGroup: 'quads',
        description: 'Developing explosive power from the bottom.',
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Box'],
        steps: ['Squat to box.', 'Pause.', 'Drive up.']
    },
    {
        id: 'split-squats',
        name: 'Split Squats',
        muscleGroup: 'quads',
        description: 'Static lunges for leg strength.',
        difficulty: 'intermediate',
        equipment: ['Dumbbells'],
        steps: ['Step out.', 'Lower vertically.']
    },
    {
        id: 'leg-press-heavy',
        name: 'Leg Press (Heavy)',
        muscleGroup: 'quads',
        description: 'Max overload for leg hypertrophy.',
        difficulty: 'intermediate',
        equipment: ['Leg Press Machine'],
        steps: ['Full stack.', 'Deep reps.']
    },

    // Advanced
    {
        id: 'back-squat-heavy',
        name: 'Back Squat (Heavy)',
        muscleGroup: 'quads',
        description: 'Absolute leg strength.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Rack'],
        steps: ['Max load.', 'Braced core.', 'Heavy drive.']
    },
    {
        id: 'deadlift-legs',
        name: 'Deadlift',
        muscleGroup: 'hamstrings',
        description: 'Posterior chain powerhouse.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Heavy pull.', 'Lockout.']
    },
    {
        id: 'deficit-squats',
        name: 'Deficit Squats',
        muscleGroup: 'quads',
        description: 'Standing on plates for extra depth.',
        difficulty: 'advanced',
        equipment: ['Barbell', 'Plates'],
        steps: ['Stand on plates.', 'Deeper than parallel.']
    },
    {
        id: 'pistol-squats',
        name: 'Pistol Squats',
        muscleGroup: 'quads',
        description: 'Single-leg elite bodyweight move.',
        difficulty: 'advanced',
        equipment: ['Bodyweight'],
        steps: ['One leg out.', 'Squat to floor.', 'Stand up.']
    },
    {
        id: 'nordic-hamstring-curls',
        name: 'Nordic Hamstring Curls',
        muscleGroup: 'hamstrings',
        description: 'Elite level eccentric hamstring strength.',
        difficulty: 'advanced',
        equipment: ['Partner / Anchor'],
        steps: ['Kneeling.', 'Lower torso slowly using hams.']
    },
    {
        id: 'jefferson-squats',
        name: 'Jefferson Squats',
        muscleGroup: 'quads',
        description: 'Straddle the barbell for unique leg stimulus.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Straddle bar.', 'Lift and squat.']
    },
    {
        id: 'zercher-squats',
        name: 'Zercher Squats',
        muscleGroup: 'quads',
        description: 'Bar in the crook of elbows.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Elbow carry.', 'Core killer squats.']
    },
    {
        id: 'snatch-deadlift',
        name: 'Snatch Deadlift',
        muscleGroup: 'hamstrings',
        description: 'Wide grip deadlifts for back and legs.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Snatch grip.', 'Deep pull.']
    },
    {
        id: 'pause-squats',
        name: 'Pause Squats',
        muscleGroup: 'quads',
        description: 'Stopping at the bottom to remove momentum.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Pause at bottom for 2s.', 'Explode.']
    },
    {
        id: 'tempo-lunges',
        name: 'Tempo Lunges',
        muscleGroup: 'quads',
        description: 'Slow, controlled lunges for time under tension.',
        difficulty: 'advanced',
        equipment: ['Weights'],
        steps: ['Slow descent.', 'Hold.', 'Return.']
    },

    // --- GLUTES ---
    // Beginner
    {
        id: 'frog-pumps',
        name: 'Frog Pumps',
        muscleGroup: 'glutes',
        description: 'Feet together, knees out - high glute activation.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Butterly feet.', 'Bridge up.']
    },
    {
        id: 'donkey-kicks',
        name: 'Donkey Kicks',
        muscleGroup: 'glutes',
        description: 'Isolating one glute at a time.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['All fours.', 'Kick foot to ceiling.']
    },
    {
        id: 'fire-hydrants',
        name: 'Fire Hydrants',
        muscleGroup: 'glutes',
        description: 'Targets the glute medius.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['All fours.', 'Lift knee to side.']
    },
    {
        id: 'resistance-band-walks',
        name: 'Resistance Band Walks',
        muscleGroup: 'glutes',
        description: 'Constant tension for side glutes.',
        difficulty: 'beginner',
        equipment: ['Mini Band'],
        steps: ['Band above knees.', 'Monster walk sideways.']
    },
    {
        id: 'kickbacks-beginner',
        name: 'Kickbacks',
        muscleGroup: 'glutes',
        description: 'Bodyweight glute focus.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['Kick back and squeeze.']
    },

    // --- SHOULDERS ---
    // Beginner
    {
        id: 'db-shoulder-press-beg',
        name: 'Dumbbell Shoulder Press',
        muscleGroup: 'shoulders',
        description: 'Steady pressing for development.',
        difficulty: 'beginner',
        equipment: ['Dumbbells'],
        steps: ['Press up from shoulders.', 'Lock out.']
    },
    {
        id: 'front-raises',
        name: 'Front Raises',
        muscleGroup: 'shoulders',
        description: 'Targets front deltoids.',
        difficulty: 'beginner',
        equipment: ['Dumbbells'],
        steps: ['Lift weight in front to eye level.']
    },
    {
        id: 'arnold-press-light',
        name: 'Arnold Press (Light)',
        muscleGroup: 'shoulders',
        description: 'Rotation helps hit all delts.',
        difficulty: 'beginner',
        equipment: ['Dumbbells'],
        steps: ['Rotate palms as you press.']
    },

    // --- BICEPS ---
    // Beginner
    {
        id: 'hammer-curl',
        name: 'Hammer Curl',
        muscleGroup: 'biceps',
        description: 'Targets the brachialis and forearms.',
        difficulty: 'beginner',
        equipment: ['Dumbbells'],
        steps: ['Neutral grip.', 'Curl.']
    },
    {
        id: 'preacher-curl-light',
        name: 'Preacher Curl (Light)',
        muscleGroup: 'biceps',
        description: 'Strict bicep focus on a pad.',
        difficulty: 'beginner',
        equipment: ['Preacher Bench', 'Dumbbell'],
        steps: ['Arm on pad.', 'Curl.']
    },

    // --- TRICEPS ---
    {
        id: 'bench-dips',
        name: 'Bench Dips',
        muscleGroup: 'triceps',
        description: 'Easier version of bar dips.',
        difficulty: 'beginner',
        equipment: ['Bench'],
        steps: ['Hands on bench behind you.', 'Lower and push.']
    },
    {
        id: 'skull-crushers',
        name: 'Skull Crushers',
        muscleGroup: 'triceps',
        description: 'Classic tricep mass builder.',
        difficulty: 'intermediate',
        equipment: ['EZ Bar or DBs'],
        steps: ['Lower weight to forehead.', 'Extend arms.']
    },

    // --- CORE / ABS ---
    {
        id: 'dead-bug',
        name: 'Dead Bug',
        muscleGroup: 'abs',
        description: 'Excellent for core stability and control.',
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        steps: ['On back.', 'Alternate arm/leg lowers.', 'Keep back flat.']
    },
    {
        id: 'russian-twists',
        name: 'Russian Twists',
        muscleGroup: 'abs',
        description: 'Targets obliques and rotation.',
        difficulty: 'beginner',
        equipment: ['Bodyweight / Med Ball'],
        steps: ['Rotate torso side to side.', 'Keep feet up.']
    },
    {
        id: 'ab-rollouts',
        name: 'Ab Rollouts',
        muscleGroup: 'abs',
        description: 'Heavy core demand hitting the whole midsection.',
        difficulty: 'intermediate',
        equipment: ['Ab Wheel'],
        steps: ['Roll out from knees.', 'Pull back using abs.']
    },

    // --- CARDIO / FULL BODY ---
    // Beginner
    {
        id: 'walking',
        name: 'Walking',
        muscleGroup: 'cardio',
        description: 'Basic low-intensity cardio.',
        difficulty: 'beginner',
        equipment: ['None'],
        steps: ['Maintain a brisk pace.', 'Steady breathing.']
    },
    {
        id: 'cycling-beg',
        name: 'Cycling',
        muscleGroup: 'cardio',
        description: 'Low-impact cardiovascular work.',
        difficulty: 'beginner',
        equipment: ['Bike'],
        steps: ['Steady pedaling.', 'Moderate resistance.']
    },
    {
        id: 'shadow-boxing',
        name: 'Shadow Boxing',
        muscleGroup: 'full_body',
        description: 'Cardio and coordination.',
        difficulty: 'beginner',
        equipment: ['None'],
        steps: ['Punch the air.', 'Move your feet.']
    },
    // Intermediate
    {
        id: 'hiit-circuits',
        name: 'HIIT Circuits',
        muscleGroup: 'full_body',
        description: 'High-intensity interval training.',
        difficulty: 'intermediate',
        equipment: ['Mixed'],
        steps: ['30s work.', '30s rest.', 'Max effort.']
    },
    {
        id: 'burpees',
        name: 'Burpees',
        muscleGroup: 'full_body',
        description: 'Cardio and strength powerhouse.',
        difficulty: 'intermediate',
        equipment: ['Bodyweight'],
        steps: ['Drop to floor.', 'Push up.', 'Jump up.']
    },
    // Advanced
    {
        id: 'sprint-training',
        name: 'Sprint Training',
        muscleGroup: 'cardio',
        description: 'Max speed intervals.',
        difficulty: 'advanced',
        equipment: ['Track / Open Space'],
        steps: ['100% effort sprints.', 'Full recovery.']
    },
    {
        id: 'olympic-lifts',
        name: 'Olympic Lifts',
        muscleGroup: 'full_body',
        description: 'Clean & Jerk or Snatch.',
        difficulty: 'advanced',
        equipment: ['Barbell'],
        steps: ['Explosive pull.', 'Catch.', 'Drive overhead.']
    }
];
