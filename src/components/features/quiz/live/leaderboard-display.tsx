import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Medal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { userService } from "@/lib/services/api";

// Định nghĩa cấu trúc dữ liệu người tham gia trong bảng xếp hạng
export interface LeaderboardItem {
  user_id: string | number;
  score: number;
  name?: string;
  student_id?: string;
}

// Thông tin người dùng đã lấy từ API
interface UserInfo {
  name: string;
  email: string;
  student_id?: string;
}

type LeaderboardDisplayProps = {
  leaderboard: LeaderboardItem[];
  totalQuestions: number;
  currentQuestionIndex: number;
  isLastQuestion: boolean;
  countdownTime?: number; // Thời gian đếm ngược (giây) trước khi chuyển sang câu hỏi tiếp theo
  onCountdownComplete?: () => void; // Callback khi kết thúc đếm ngược
};

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({
  leaderboard,
  totalQuestions,
  currentQuestionIndex,
  isLastQuestion,
  countdownTime = 5,
  onCountdownComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownTime);
  const [usersInfo, setUsersInfo] = useState<Record<string | number, UserInfo>>(
    {}
  );
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUsersInfo = async () => {
      if (leaderboard.length === 0) {
        setLoadingUsers(false);
        return;
      }

      setLoadingUsers(true);
      const userInfoMap: Record<string | number, UserInfo> = {};

      try {
        // Lấy thông tin của tất cả người dùng trong leaderboard
        const promises = leaderboard.map(async (item) => {
          // Kiểm tra nếu đã có tên người dùng thì không cần gọi API
          if (item.name) {
            userInfoMap[item.user_id] = {
              name: item.name,
              email: "",
              student_id: item.student_id,
            };
            return Promise.resolve(); // Trả về Promise resolved
          }

          try {
            const response = await userService.getUserById(
              String(item.user_id)
            );
            console.log(`Dữ liệu người dùng ${item.user_id}:`, response);

            // Xử lý response với wrapper success/data
            if (response?.success && response?.data) {
              userInfoMap[item.user_id] = {
                name: response.data.name || `Người dùng #${item.user_id}`,
                email: response.data.email || "",
                student_id: response.data.student_id || "",
              };
            } else {
              console.warn(
                `Unexpected user response structure for ${item.user_id}:`,
                response
              );
              userInfoMap[item.user_id] = {
                name: `Người dùng #${item.user_id}`,
                email: "",
                student_id: "",
              };
            }
          } catch (error) {
            console.error(
              `Lỗi khi lấy thông tin người dùng ${item.user_id}:`,
              error
            );
            // Fallback name nếu có lỗi
            userInfoMap[item.user_id] = {
              name: `Người dùng #${item.user_id}`,
              email: "",
              student_id: "",
            };
          }
        });

        await Promise.all(promises);
        console.log("Thông tin người dùng đã lấy được:", userInfoMap);
        setUsersInfo(userInfoMap);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsersInfo();
  }, [leaderboard]);

  useEffect(() => {
    if (timeLeft === 0) {
      onCountdownComplete?.();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, onCountdownComplete]);

  // Lấy tên người dùng
  const getUserName = (item: LeaderboardItem) => {
    if (usersInfo[item.user_id]) {
      return usersInfo[item.user_id].name;
    }
    return item.name || `Người chơi ${item.user_id}`;
  };

  // Kiểm tra nếu danh sách ít hơn 5 người, thêm class h-screen
  const hasMinimalParticipants = leaderboard.length < 5;

  return (
    <div
      className={cn(
        "flex flex-col w-full bg-white",
        hasMinimalParticipants ? "h-screen" : "min-h-screen"
      )}
    >
      <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 flex flex-col flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trophy className="h-8 w-8 md:h-10 md:w-10 text-yellow-500 shrink-0" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent whitespace-nowrap py-2 leading-normal">
              Bảng xếp hạng
            </h2>
            <Trophy className="h-8 w-8 md:h-10 md:w-10 text-yellow-500 shrink-0" />
          </div>
          <p className="text-lg md:text-xl text-gray-600 mb-4">
            {isLastQuestion
              ? "Kết quả cuối cùng"
              : `Sau câu hỏi ${currentQuestionIndex + 1}/${totalQuestions}`}
          </p>

          {!isLastQuestion && (
            <div className="mt-4 text-center">
              <span className="text-lg text-gray-600">
                Câu hỏi tiếp theo sẽ hiển thị trong giây lát...
              </span>
            </div>
          )}
        </motion.div>

        {/* Nội dung bảng xếp hạng */}
        <div
          className={cn(
            "flex-1",
            hasMinimalParticipants ? "flex flex-col items-center" : ""
          )}
        >
          <AnimatePresence>
            {loadingUsers && leaderboard.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-6"
              >
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                <span className="text-gray-600">
                  Đang tải thông tin người dùng...
                </span>
              </motion.div>
            )}

            {leaderboard.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-10 border-2 border-dashed border-gray-300 rounded-xl"
              >
                <p className="text-xl text-gray-500">
                  Chưa có dữ liệu bảng xếp hạng
                </p>
              </motion.div>
            ) : (
              <div className="w-full">
                {/* Top 3 */}
                {leaderboard.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <h3 className="text-2xl font-bold text-gray-800">
                        Top 3
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Hiển thị 2 và 3 trước, 1 ở giữa và cao hơn */}
                      {leaderboard.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                          className="flex flex-col items-center md:mt-8"
                          style={{ order: 1 }}
                        >
                          {leaderboard[1] && (
                            <div className="w-full">
                              <div className="bg-gray-100 rounded-xl border border-gray-400 p-4 text-center shadow-sm">
                                <div className="flex justify-center mb-2">
                                  <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm">
                                    <Award className="h-6 w-6 text-gray-500" />
                                  </div>
                                </div>
                                <h4 className="font-bold text-lg mb-1 px-2 truncate">
                                  {getUserName(leaderboard[1])}
                                </h4>
                                {usersInfo[leaderboard[1].user_id]
                                  ?.student_id && (
                                  <p className="text-sm text-gray-500 mb-2 px-2 truncate">
                                    {
                                      usersInfo[leaderboard[1].user_id]
                                        .student_id
                                    }
                                  </p>
                                )}
                                <div className="text-2xl font-bold text-gray-700">
                                  {leaderboard[1].score}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Top 1 */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center"
                        style={{ order: 2 }}
                      >
                        {leaderboard[0] && (
                          <div className="w-full">
                            <div className="bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-400 p-5 text-center shadow-lg relative overflow-hidden">
                              {/* Hiệu ứng ánh sáng */}
                              <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-200 opacity-30 rounded-full blur-xl"></div>
                              <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-yellow-200 opacity-30 rounded-full blur-xl"></div>

                              {/* Biểu tượng số 1 */}
                              <div className="absolute top-2 right-2 text-yellow-300 text-opacity-30 text-4xl font-bold">
                                1
                              </div>

                              <div className="flex justify-center mb-3 relative">
                                <div className="bg-gradient-to-r from-yellow-50 to-white w-20 h-20 rounded-full flex items-center justify-center shadow-md border-2 border-yellow-300">
                                  <Trophy className="h-10 w-10 text-yellow-500" />
                                </div>
                              </div>
                              <h4 className="font-bold text-2xl mb-1 px-2 truncate">
                                {getUserName(leaderboard[0])}
                              </h4>
                              {usersInfo[leaderboard[0].user_id]
                                ?.student_id && (
                                <p className="text-sm text-gray-500 mb-2 px-2 truncate">
                                  {usersInfo[leaderboard[0].user_id].student_id}
                                </p>
                              )}
                              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text text-transparent mt-3">
                                {leaderboard[0].score}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Top 3 */}
                      {leaderboard.length > 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="flex flex-col items-center md:mt-8"
                          style={{ order: 3 }}
                        >
                          {leaderboard[2] && (
                            <div className="w-full">
                              <div className="bg-amber-100 rounded-xl border border-amber-400 p-4 text-center shadow-sm">
                                <div className="flex justify-center mb-2">
                                  <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm">
                                    <Medal className="h-6 w-6 text-amber-500" />
                                  </div>
                                </div>
                                <h4 className="font-bold text-lg mb-1 px-2 truncate">
                                  {getUserName(leaderboard[2])}
                                </h4>
                                {usersInfo[leaderboard[2].user_id]
                                  ?.student_id && (
                                  <p className="text-sm text-gray-500 mb-2 px-2 truncate">
                                    {
                                      usersInfo[leaderboard[2].user_id]
                                        .student_id
                                    }
                                  </p>
                                )}
                                <div className="text-2xl font-bold text-amber-700">
                                  {leaderboard[2].score}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Xếp hạng còn lại */}
                {leaderboard.length > 3 && (
                  <div className="mt-10">
                    <div className="flex items-center gap-2 mb-5">
                      <Award className="h-6 w-6 text-blue-500" />
                      <h3 className="text-2xl font-bold text-gray-800">
                        Xếp hạng
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {leaderboard.slice(3).map((item, idx) => {
                        const index = idx + 3; // Bắt đầu từ vị trí thứ 4
                        return (
                          <motion.div
                            key={item.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="bg-white p-4 rounded-lg border border-gray-200 flex items-center shadow-sm overflow-hidden"
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 shrink-0">
                              <span className="font-bold text-gray-500">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium block truncate">
                                {getUserName(item)}
                              </span>
                              {usersInfo[item.user_id]?.student_id && (
                                <p className="text-xs text-gray-500 truncate">
                                  {usersInfo[item.user_id].student_id}
                                </p>
                              )}
                            </div>
                            <div className="text-xl font-bold text-primary ml-2 shrink-0">
                              {item.score}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardDisplay;
