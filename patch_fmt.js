const fs = require('fs');
let code = fs.readFileSync('d:/Libraries/Apps/jazacademy.id/app/Services/MediaFormatter.php', 'utf8');

code = code.replace(
    "'student_id' => $student?->id,",
    "'student_id' => $student?->id,\n            'admin_student_id' => $student?->id,"
);
code = code.replace(
    "'teacher_id' => $teacher?->id,",
    "'teacher_id' => $teacher?->id,\n            'admin_teacher_id' => $teacher?->id,"
);

fs.writeFileSync('d:/Libraries/Apps/jazacademy.id/app/Services/MediaFormatter.php', code);
console.log('done');
