// Validation rules, error messages, and form constants

// Validation Rules
export const VALIDATION_RULES = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },

  // Email validation
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // Username validation
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },

  // Name validation
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZÀ-ỹ\s]+$/,
  },

  // Phone validation
  PHONE: {
    PATTERN: /^(\+84|0)[0-9]{9,10}$/,
  },

  // Quiz validation
  QUIZ: {
    TITLE: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 200,
    },
    DESCRIPTION: {
      MAX_LENGTH: 1000,
    },
    DURATION: {
      MIN_MINUTES: 1,
      MAX_MINUTES: 300,
    },
    QUESTIONS: {
      MIN_COUNT: 1,
      MAX_COUNT: 100,
    },
  },

  // Question validation
  QUESTION: {
    CONTENT: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 1000,
    },
    ANSWERS: {
      MIN_COUNT: 2,
      MAX_COUNT: 6,
      MIN_LENGTH: 1,
      MAX_LENGTH: 500,
    },
  },

  // Subject validation
  SUBJECT: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
    CODE: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 20,
      PATTERN: /^[A-Z0-9]+$/,
    },
  },

  // File upload validation
  FILE_UPLOAD: {
    MAX_SIZE_MB: 10,
    ALLOWED_TYPES: {
      IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      DOCUMENTS: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      EXCEL: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    },
  },
};

// Error Messages
export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: "Trường này là bắt buộc.",
  
  // Email messages
  EMAIL_INVALID: "Địa chỉ email không hợp lệ.",
  EMAIL_REQUIRED: "Vui lòng nhập địa chỉ email.",
  EMAIL_TOO_LONG: "Địa chỉ email quá dài (tối đa 254 ký tự).",

  // Password messages
  PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu.",
  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 8 ký tự.",
  PASSWORD_TOO_LONG: "Mật khẩu không được quá 128 ký tự.",
  PASSWORD_WEAK: "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số.",
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp.",

  // Username messages
  USERNAME_REQUIRED: "Vui lòng nhập tên đăng nhập.",
  USERNAME_TOO_SHORT: "Tên đăng nhập phải có ít nhất 3 ký tự.",
  USERNAME_TOO_LONG: "Tên đăng nhập không được quá 50 ký tự.",
  USERNAME_INVALID: "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang.",

  // Name messages
  NAME_REQUIRED: "Vui lòng nhập họ và tên.",
  NAME_TOO_SHORT: "Họ và tên phải có ít nhất 2 ký tự.",
  NAME_TOO_LONG: "Họ và tên không được quá 100 ký tự.",
  NAME_INVALID: "Họ và tên chỉ được chứa chữ cái và khoảng trắng.",

  // Phone messages
  PHONE_INVALID: "Số điện thoại không hợp lệ.",
  PHONE_REQUIRED: "Vui lòng nhập số điện thoại.",

  // Quiz messages
  QUIZ_TITLE_REQUIRED: "Vui lòng nhập tiêu đề bài kiểm tra.",
  QUIZ_TITLE_TOO_SHORT: "Tiêu đề phải có ít nhất 5 ký tự.",
  QUIZ_TITLE_TOO_LONG: "Tiêu đề không được quá 200 ký tự.",
  QUIZ_DESCRIPTION_TOO_LONG: "Mô tả không được quá 1000 ký tự.",
  QUIZ_DURATION_INVALID: "Thời gian làm bài phải từ 1 đến 300 phút.",
  QUIZ_QUESTIONS_REQUIRED: "Bài kiểm tra phải có ít nhất 1 câu hỏi.",
  QUIZ_QUESTIONS_TOO_MANY: "Bài kiểm tra không được quá 100 câu hỏi.",

  // Question messages
  QUESTION_CONTENT_REQUIRED: "Vui lòng nhập nội dung câu hỏi.",
  QUESTION_CONTENT_TOO_SHORT: "Nội dung câu hỏi phải có ít nhất 10 ký tự.",
  QUESTION_CONTENT_TOO_LONG: "Nội dung câu hỏi không được quá 1000 ký tự.",
  QUESTION_ANSWERS_REQUIRED: "Câu hỏi phải có ít nhất 2 đáp án.",
  QUESTION_ANSWERS_TOO_MANY: "Câu hỏi không được quá 6 đáp án.",
  QUESTION_ANSWER_REQUIRED: "Vui lòng nhập nội dung đáp án.",
  QUESTION_ANSWER_TOO_LONG: "Nội dung đáp án không được quá 500 ký tự.",
  QUESTION_CORRECT_ANSWER_REQUIRED: "Vui lòng chọn đáp án đúng.",

  // Subject messages
  SUBJECT_NAME_REQUIRED: "Vui lòng nhập tên môn học.",
  SUBJECT_NAME_TOO_SHORT: "Tên môn học phải có ít nhất 2 ký tự.",
  SUBJECT_NAME_TOO_LONG: "Tên môn học không được quá 100 ký tự.",
  SUBJECT_CODE_REQUIRED: "Vui lòng nhập mã môn học.",
  SUBJECT_CODE_TOO_SHORT: "Mã môn học phải có ít nhất 2 ký tự.",
  SUBJECT_CODE_TOO_LONG: "Mã môn học không được quá 20 ký tự.",
  SUBJECT_CODE_INVALID: "Mã môn học chỉ được chứa chữ cái in hoa và số.",

  // File upload messages
  FILE_REQUIRED: "Vui lòng chọn file.",
  FILE_TOO_LARGE: "File quá lớn (tối đa 10MB).",
  FILE_TYPE_INVALID: "Loại file không được hỗ trợ.",
  FILE_UPLOAD_ERROR: "Có lỗi xảy ra khi tải file lên.",

  // General messages
  INVALID_FORMAT: "Định dạng không hợp lệ.",
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng thử lại.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  UNAUTHORIZED: "Bạn không có quyền thực hiện hành động này.",
  FORBIDDEN: "Truy cập bị từ chối.",
  NOT_FOUND: "Không tìm thấy dữ liệu.",
  CONFLICT: "Dữ liệu đã tồn tại.",
  VALIDATION_FAILED: "Dữ liệu không hợp lệ.",
};

// Form Field Names
export const FORM_FIELDS = {
  // Auth forms
  EMAIL: "email",
  PASSWORD: "password",
  CONFIRM_PASSWORD: "confirmPassword",
  USERNAME: "username",
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  FULL_NAME: "fullName",
  PHONE: "phone",
  REMEMBER_ME: "rememberMe",

  // Quiz forms
  QUIZ_TITLE: "title",
  QUIZ_DESCRIPTION: "description",
  QUIZ_DURATION: "duration",
  QUIZ_SUBJECT: "subjectId",
  QUIZ_LEARNING_OUTCOMES: "learningOutcomes",
  QUIZ_QUESTIONS: "questions",

  // Question forms
  QUESTION_CONTENT: "content",
  QUESTION_TYPE: "type",
  QUESTION_ANSWERS: "answers",
  QUESTION_CORRECT_ANSWER: "correctAnswer",
  QUESTION_EXPLANATION: "explanation",

  // Subject forms
  SUBJECT_NAME: "name",
  SUBJECT_CODE: "code",
  SUBJECT_DESCRIPTION: "description",
};
