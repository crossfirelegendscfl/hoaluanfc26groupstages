// Luật tính điểm:
// - Chọn đúng đội đi tiếp (đội đó thực sự lọt top ADVANCE_COUNT và bạn cũng xếp
//   đội đó vào 1 trong các vị trí đi tiếp): +16 điểm.
// - Chọn đúng đội không đi tiếp: +0 điểm (không có điểm cho việc đoán đúng đội bị loại).
// - Xếp đúng chính xác thứ hạng của đội trong bảng: +2 điểm bonus (áp dụng cho mọi vị trí).
// - Tổng điểm tối đa 1 bảng = ADVANCE_COUNT * 16 + 4 * 2 = 40 điểm (với ADVANCE_COUNT = 2).

/**
 * @param {string[]} predicted mảng 4 teamId theo thứ tự dự đoán (index 0 = hạng 1)
 * @param {string[]|null} actual mảng 4 teamId theo thứ tự thực tế, hoặc null nếu chưa có kết quả
 * @returns {null | { perTeam: Record<string, {points:number, status:'correct'|'partial'|'incorrect', predictedRank:number, actualRank:number}>, total:number, maxTotal:number }}
 */
function computeGroupScore(predicted, actual) {
  if (!actual || actual.some((v) => !v)) return null;

  const maxTotal = ADVANCE_COUNT * 16 + predicted.length * 2;
  const perTeam = {};
  let total = 0;

  predicted.forEach((teamId, predictedIndex) => {
    const actualIndex = actual.indexOf(teamId);
    const predictedAdvances = predictedIndex < ADVANCE_COUNT;
    const actuallyAdvanced = actualIndex >= 0 && actualIndex < ADVANCE_COUNT;

    const advancePoints = predictedAdvances && actuallyAdvanced ? 16 : 0;
    const orderBonus = actualIndex === predictedIndex ? 2 : 0;
    const points = advancePoints + orderBonus;
    const maxForSlot = (predictedAdvances ? 16 : 0) + 2;

    let status = "incorrect";
    if (points === maxForSlot && points > 0) status = "correct";
    else if (points > 0) status = "partial";

    perTeam[teamId] = {
      points,
      status,
      predictedRank: predictedIndex + 1,
      actualRank: actualIndex + 1,
    };
    total += points;
  });

  return { perTeam, total, maxTotal };
}
