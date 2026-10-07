const fs = require('fs');
let code = fs.readFileSync('d:/Libraries/Apps/jazacademy.id/app/Http/Controllers/Api/Media/UserMediaController.php', 'utf8');

const newLogic = `
        try {
            $type = $request->query('type');
            $user = null;
            $student = null;
            $teacher = null;
            $currentUserId = Auth::guard('sanctum')->id();

            if ($type === 'student') {
                $student = \\App\\Models\\AdminStudent::find((int)$userId);
                if ($student) {
                    $user = \\App\\Models\\User::where('admin_student_id', $student->id)->first();
                }
            } elseif ($type === 'teacher') {
                $teacher = \\App\\Models\\AdminTeacher::find((int)$userId);
                if ($teacher) {
                    $user = \\App\\Models\\User::where('admin_teacher_id', $teacher->id)->first();
                }
            } else {
                $user = $this->resolveUser($userId);
                if ($user) {
                    if ($user->admin_student_id) {
                        $student = \\App\\Models\\AdminStudent::find($user->admin_student_id);
                    } elseif ($user->admin_teacher_id) {
                        $teacher = \\App\\Models\\AdminTeacher::find($user->admin_teacher_id);
                    }
                }
            }

            if (!$user && !$student && !$teacher) {
                return response()->json(['success' => false, 'error' => 'Profil tidak ditemukan'], 404);
            }

            // Always use MediaFormatter if we have a user
            if ($user) {
                $profileData = \\App\\Services\\MediaFormatter::formatUser($user);
            } elseif ($student) {
                // Fallback for legacy student without a user record
                $profileData = [
                    'id' => (string) $student->id,
                    '_id' => (string) $student->id,
                    'student_id' => $student->id,
                    'name' => $student->name,
                    'username' => $student->nickname ?: '',
                    'email' => $student->email ?: '',
                    'image' => \\App\\Services\\MediaFormatter::formatAvatarUrl($student->image),
                    'bio' => $student->note ?: ($student->ambition ?: ''),
                    'skills' => is_array($student->skills) ? $student->skills : (json_decode($student->skills, true) ?: []),
                    'role' => 'student',
                    'role_number' => 2,
                    'student_role' => $student->role,
                    'instagramId' => $student->instagram,
                    'banner_image' => null,
                    'headline' => null,
                    'address_detail' => null,
                    'education' => [],
                    'recommendations' => [],
                ];
            } else {
                // Fallback for legacy teacher without a user record
                $profileData = [
                    'id' => (string) $teacher->id,
                    '_id' => (string) $teacher->id,
                    'teacher_id' => $teacher->id,
                    'name' => $teacher->name,
                    'username' => '',
                    'email' => $teacher->email ?: '',
                    'image' => '/no-photo.png',
                    'bio' => '',
                    'skills' => [],
                    'role' => 'mentor',
                    'role_number' => 3,
                    'banner_image' => null,
                    'headline' => null,
                    'address_detail' => null,
                    'education' => [],
                    'recommendations' => [],
                ];
            }

            // Fetch tasks
            $tasks = collect([]);
            if (($user && $user->admin_student_id) || $student) {
                $sId = $user ? $user->admin_student_id : $student->id;
                $tasks = \\App\\Models\\MediaTask::with(['student', 'mentorTeacher', 'studentCollaborators', 'project', 'likes', 'comments.user'])
                    ->where('admin_student_id', $sId)
                    ->orWhereHas('studentCollaborators', function ($q) use ($sId) {
                        $q->where('admin_student_id', $sId);
                    })
                    ->orderByDesc('created_at')
                    ->get();
            } elseif (($user && $user->admin_teacher_id) || $teacher) {
                $tId = $user ? $user->admin_teacher_id : $teacher->id;
                $tasks = \\App\\Models\\MediaTask::with(['student', 'mentorTeacher', 'studentCollaborators', 'project', 'likes', 'comments.user'])
                    ->where('admin_teacher_id', $tId)
                    ->orderByDesc('created_at')
                    ->get();
            }

            $formattedTasks = \\App\\Services\\MediaFormatter::formatTasks($tasks, $currentUserId);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $profileData,
                    'tasks' => $formattedTasks
                ]
            ]);
        } catch (\\Exception $e) {
`;

const startIdx = code.indexOf('public function publicProfile');
const endIdx = code.indexOf('public function updateUserInstagram', startIdx);
const oldFunc = code.substring(startIdx, endIdx);

const parts = code.split(oldFunc);
const newCode = parts[0] + 
  'public function publicProfile(\\Illuminate\\Http\\Request $request, $userId)\n    {\n' + 
  newLogic + 
  '            return response()->json([\'success\' => false, \'error\' => $e->getMessage()], 500);\n        }\n    }\n\n    ' + 
  parts[1];

fs.writeFileSync('d:/Libraries/Apps/jazacademy.id/app/Http/Controllers/Api/Media/UserMediaController.php', newCode);
console.log('done');
