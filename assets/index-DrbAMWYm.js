var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _winningNumbers, _bonusNumber, _numbers, _lottoCalculator;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const RANK_INFO_TABLE = {
  1: { price: 2e9, message: "6개" },
  2: { price: 3e7, message: "5개+보너스 볼" },
  3: { price: 15e5, message: "5개" },
  4: { price: 5e4, message: "4개" },
  5: { price: 5e3, message: "3개" }
};
class LottoCalculator {
  constructor(winningNumbers, bonusNumber) {
    __privateAdd(this, _winningNumbers);
    __privateAdd(this, _bonusNumber);
    __privateSet(this, _winningNumbers, winningNumbers);
    __privateSet(this, _bonusNumber, bonusNumber);
  }
  calculatePrize(lottos) {
    return lottos.reduce(
      (result, lotto) => {
        const matchCount = lotto.countNumbersMatch(__privateGet(this, _winningNumbers));
        const isMatchBonus = lotto.isMatch(__privateGet(this, _bonusNumber));
        const rank = this.calculateRank(matchCount, isMatchBonus);
        if (rank > 0) {
          result[rank - 1].lottos.push(lotto);
        }
        return result;
      },
      [
        { rank: 1, lottos: [] },
        { rank: 2, lottos: [] },
        { rank: 3, lottos: [] },
        { rank: 4, lottos: [] },
        { rank: 5, lottos: [] }
      ]
    );
  }
  calculateRank(matchCount, isMatchBonus) {
    if (matchCount === 6) return 1;
    if (matchCount === 5 && isMatchBonus) return 2;
    if (matchCount === 5) return 3;
    if (matchCount === 4) return 4;
    if (matchCount === 3) return 5;
    return 0;
  }
  calculateTotalPrice(prize) {
    return prize.reduce((sum, prizeGroup) => {
      const info = RANK_INFO_TABLE[prizeGroup.rank];
      return sum + info.price * prizeGroup.lottos.length;
    }, 0);
  }
  calculateProfit(totalPrice, purchaseMoney) {
    return totalPrice / purchaseMoney * 100;
  }
}
_winningNumbers = new WeakMap();
_bonusNumber = new WeakMap();
class Lotto {
  constructor(numbers) {
    __privateAdd(this, _numbers);
    __privateSet(this, _numbers, numbers);
  }
  countNumbersMatch(numbers) {
    return numbers.reduce((acc, number) => acc + this.isMatch(number), 0);
  }
  isMatch(number) {
    return __privateGet(this, _numbers).includes(number);
  }
  get numbers() {
    return __privateGet(this, _numbers);
  }
}
_numbers = new WeakMap();
const CONSTANT = {
  MIN_LOTTO_VALUE: 1,
  MAX_LOTTO_VALUE: 45
};
function drawRandomNumbers(count) {
  const randomNumbers = /* @__PURE__ */ new Set();
  while (randomNumbers.size < count) {
    const randomNumber = Math.floor(
      Math.random() * CONSTANT.MAX_LOTTO_VALUE + CONSTANT.MIN_LOTTO_VALUE
    );
    randomNumbers.add(randomNumber);
  }
  return Array.from(randomNumbers).sort((a, b) => a - b);
}
class LottoMachine {
  getLottoCount(input) {
    const lottoCount = input / 1e3;
    return lottoCount;
  }
  drawLotto(count) {
    return Array.from({ length: count }).map(() => {
      const randomNumber = drawRandomNumbers(6);
      return new Lotto(randomNumber);
    });
  }
}
const inputView = {
  getPurchaseMoney() {
    return new Promise((resolve, reject) => {
      const purchaseButton = document.querySelector(".purchase-button");
      const purchaseInput = document.querySelector(".purchase-input");
      const handleClick = () => {
        let value = purchaseInput.value.replace(/,/g, "").trim();
        value = Number(value);
        console.log("입력된 값:", purchaseInput.value, "변환된 값:", value);
        if (Number.isNaN(value) || !Number.isInteger(value) || value <= 0 || value % 1e3 !== 0) {
          alert("올바른 금액을 입력하세요. (1000원 단위)");
          return;
        }
        purchaseButton.removeEventListener("click", handleClick);
        resolve(value);
      };
      purchaseButton.addEventListener("click", handleClick);
    });
  },
  getWinningNumbers() {
    return new Promise((resolve, reject) => {
      const winningInputs = document.querySelectorAll(
        ".number-input-box .winning-number"
      );
      const resultButton = document.querySelector(".result-button");
      const handleClick = () => {
        const numbers = Array.from(winningInputs).map((input) => {
          const value = Number(input.value);
          return value >= 1 && value <= 45 && !isNaN(value) ? value : NaN;
        });
        if (numbers.includes(NaN) || numbers.length !== 6) {
          alert("올바른 당첨 번호를 입력하세요! (1~45 사이의 6개 숫자)");
          return;
        }
        resultButton.removeEventListener("click", handleClick);
        resolve(numbers);
      };
      resultButton.addEventListener("click", handleClick);
    });
  },
  getBonusNumber(winningNumbers) {
    return new Promise((resolve, reject) => {
      const bonusInput = document.querySelector(
        ".number-input-box .bonus-number"
      );
      const resultButton = document.querySelector(".result-button");
      const handleClick = () => {
        const bonusNumber = Number(bonusInput.value);
        if (bonusNumber < 1 || bonusNumber > 45 || isNaN(bonusNumber) || winningNumbers.includes(bonusNumber)) {
          alert("올바른 보너스 번호를 입력하세요! (1~45, 당첨 번호와 중복 X)");
          return;
        }
        resultButton.removeEventListener("click", handleClick);
        resolve(bonusNumber);
      };
      resultButton.addEventListener("click", handleClick);
    });
  },
  getRestartRequest() {
    return new Promise((resolve) => {
      const restartButton = document.querySelector(".restart-button");
      restartButton.addEventListener(
        "click",
        () => {
          resolve("y");
        },
        { once: true }
      );
    });
  }
};
const outputView = {
  printLottoCount(lottoCount) {
    const lottoCountContainer = document.querySelector(
      ".lotto-list-container p"
    );
    lottoCountContainer.innerText = `총 ${lottoCount}개를 구매하였습니다.`;
  },
  printLotto(lottos) {
    const lottoListContainer = document.querySelector(".lotto-list");
    lottoListContainer.innerHTML = "";
    lottos.forEach((lotto) => {
      const lottoElement = document.createElement("div");
      lottoElement.classList.add("lotto");
      const lottoIcon = document.createElement("div");
      lottoIcon.classList.add("lotto-icon");
      lottoIcon.innerText = "🎟️";
      const lottoNumbers = document.createElement("p");
      lottoNumbers.classList.add("body-text");
      lottoNumbers.innerText = lotto.numbers.join(", ");
      lottoElement.appendChild(lottoIcon);
      lottoElement.appendChild(lottoNumbers);
      lottoListContainer.appendChild(lottoElement);
    });
  },
  printResult(prize, profit) {
    const resultContainer = document.querySelector(".modal-container");
    const modalTable = resultContainer.querySelector(".modal-table");
    modalTable.innerHTML = "";
    modalTable.appendChild(document.createElement("div")).classList.add("modal-table-divider");
    const tableHeaderRow = document.createElement("div");
    tableHeaderRow.classList.add("modal-table-row");
    tableHeaderRow.innerHTML = `
      <p class="modal-table-cell">일치 갯수</p>
      <p class="modal-table-cell">당첨금</p>
      <p class="modal-table-cell">당첨 갯수</p>
    `;
    modalTable.appendChild(tableHeaderRow);
    modalTable.appendChild(document.createElement("div")).classList.add("modal-table-divider");
    for (let rank = 1; rank <= 5; rank++) {
      const rankInfo = RANK_INFO_TABLE[rank];
      if (rankInfo) {
        const rankLottos = prize[rank - 1] || { lottos: [] };
        const rankRow = document.createElement("div");
        rankRow.classList.add("modal-table-row");
        rankRow.innerHTML = `
          <p class="modal-table-cell">${rankInfo.message}</p>
          <p class="modal-table-cell">${rankInfo.price.toLocaleString()}</p>
          <p class="modal-table-cell">${rankLottos.lottos.length}개</p>
        `;
        modalTable.appendChild(rankRow);
        modalTable.appendChild(document.createElement("div")).classList.add("modal-table-divider");
      }
    }
    const profitMessage = document.createElement("p");
    profitMessage.classList.add("profit-text");
    profitMessage.innerText = `당신의 총 수익률은 ${profit}%입니다.`;
    resultContainer.appendChild(profitMessage);
    const restartButton = document.createElement("button");
    restartButton.classList.add("restart-button");
    restartButton.innerText = "다시 시작하기";
    resultContainer.appendChild(restartButton);
    restartButton.addEventListener("click", () => {
      document.querySelector(".modal").style.display = "none";
      document.querySelector(".lotto-list-container").style.display = "none";
      document.querySelector(".number-input-form").style.display = "none";
      document.querySelector(".result-button-container").style.display = "none";
      location.reload();
    });
  }
};
class App {
  constructor() {
    __privateAdd(this, _lottoCalculator);
  }
  async run() {
    const purchaseMoney = await inputView.getPurchaseMoney();
    const lottoMachine = new LottoMachine();
    const lottoCount = lottoMachine.getLottoCount(purchaseMoney);
    const lottos = lottoMachine.drawLotto(lottoCount);
    outputView.printLottoCount(lottoCount);
    outputView.printLotto(lottos);
    const winningNumbers = await inputView.getWinningNumbers();
    const bonusNumber = await inputView.getBonusNumber(winningNumbers);
    __privateSet(this, _lottoCalculator, new LottoCalculator(winningNumbers, bonusNumber));
    this.calculateResult(lottos, purchaseMoney);
    this.printResult();
    await this.restart();
  }
  calculateResult(lottos, purchaseMoney) {
    const prize = __privateGet(this, _lottoCalculator).calculatePrize(lottos);
    const totalPrice = __privateGet(this, _lottoCalculator).calculateTotalPrice(prize);
    const profit = __privateGet(this, _lottoCalculator).calculateProfit(
      totalPrice,
      purchaseMoney
    );
    this.prize = prize;
    this.totalPrice = totalPrice;
    this.profit = profit;
  }
  printResult() {
    outputView.printResult(this.prize, this.profit);
  }
  async restart() {
    const restartAnswer = await inputView.getRestartRequest();
    if (restartAnswer === "y") {
      await this.run();
    }
  }
}
_lottoCalculator = new WeakMap();
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  const purchaseButton = document.querySelector(".purchase-button");
  const resultButton = document.querySelector(".result-button");
  if (purchaseButton) {
    purchaseButton.addEventListener("click", () => {
      app.run();
      document.querySelector(".lotto-list-container").style.display = "flex";
      document.querySelector(".number-input-form").style.display = "flex";
      document.querySelector(".result-button-container").style.display = "flex";
    });
  }
  if (resultButton) {
    resultButton.addEventListener("click", () => {
      document.querySelector(".modal").style.display = "flex";
    });
  }
  const closeButton = document.querySelector(".modal-close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      document.querySelector(".modal").style.display = "none";
    });
  }
});
