/**
 *Submitted for verification at polygonscan.com on 2022-02-14
*/

pragma solidity >=0.5.10;

contract MaticHeaven {
    using SafeMath for uint256;

    uint256 constant public INVEST_MIN_AMOUNT = 0.1 ether;
    uint256 constant public WITHDRAW_MIN_AMOUNT = 1 ether;
    uint256[] public REFERRAL_PERCENTS = [50, 30, 10];
    uint256 constant public TOTAL_REF = 90;
    uint256 constant public DEV_FEE = 100;
    uint256 constant public REINVEST_DEV_FEE = 50;
    uint256 constant public REINVEST_ON_WITHDRAWAL = 200;
    uint256 constant public REINVEST_BONUS = 50;
    uint256 constant public PERCENTS_DIVIDER = 1000;
    uint256 constant public TIME_STEP = 1 days;

    uint256 public totalInvested;
    uint256 public totalReferral;

    struct Plan {
        uint256 time;
        uint256 percent;
    }

    Plan[] internal plans;

    struct Deposit {
        uint8 plan;
        uint256 amount;
        uint256 start;
    }

    struct User {
        Deposit[] deposits;
        uint256 checkpoint;
        address referrer;
        uint256[3] levels;
        uint256 bonus;
        uint256 totalBonus;
        uint256 withdrawn;
    }

    mapping (address => User) internal users;

    uint256 public startDate;

    address payable public devWallet;

    event Newbie(address user);
    event NewDeposit(address indexed user, uint8 plan, uint256 amount, uint256 time);
    event Withdrawn(address indexed user, uint256 amount, uint256 time);
    event RefBonus(address indexed referrer, address indexed referral, uint256 indexed level, uint256 amount);
    event FeePaid(address indexed user, uint256 totalAmount);

    constructor(uint256 start) public {
        devWallet = 0xf301f2193FEAdd6397d97f898214BdE58ebFE21C;

        if(start > 0) {
            startDate = start;
        } else {
            startDate = block.timestamp;
        }

        plans.push(Plan(8, 170));
        plans.push(Plan(60, 70));
    }

    function invest(address referrer, uint8 plan) public payable {
        require(block.timestamp > startDate, "contract does not launch yet");
        require(msg.value >= INVEST_MIN_AMOUNT, "invest min amount is not reached");
        require(plan < 2, "Invalid plan");

        User storage user = users[msg.sender];
        require(user.deposits.length < 100, "Max 100 deposits per address");

        uint256 dFee = msg.value.mul(DEV_FEE).div(PERCENTS_DIVIDER);
        devWallet.transfer(dFee);
        emit FeePaid(msg.sender, dFee);

        if (user.referrer == address(0)) {
            if (users[referrer].deposits.length > 0 && referrer != msg.sender) {
                user.referrer = referrer;
            }

            address upline = user.referrer;
            for (uint256 i = 0; i < 3; i++) {
                if (upline != address(0)) {
                    users[upline].levels[i] = users[upline].levels[i].add(1);
                    upline = users[upline].referrer;
                } else break;
            }
        }

        if (user.referrer != address(0)) {
            address upline = user.referrer;
            for (uint256 i = 0; i < 3; i++) {
                if (upline != address(0)) {
                    uint256 amount = msg.value.mul(REFERRAL_PERCENTS[i]).div(PERCENTS_DIVIDER);
                    users[upline].bonus = users[upline].bonus.add(amount);
                    users[upline].totalBonus = users[upline].totalBonus.add(amount);
                    totalReferral = totalReferral.add(amount);
                    emit RefBonus(upline, msg.sender, i, amount);
                    upline = users[upline].referrer;
                } else break;
            }
        } else {
            uint256 amount = msg.value.mul(TOTAL_REF).div(PERCENTS_DIVIDER);
            devWallet.transfer(amount);
            totalReferral = totalReferral.add(amount);
        }
        if (user.deposits.length == 0) {
            user.checkpoint = block.timestamp;
            emit Newbie(msg.sender);
        }
        user.deposits.push(Deposit(plan, msg.value, block.timestamp));
        totalInvested = totalInvested.add(msg.value);
        emit NewDeposit(msg.sender, plan, msg.value, block.timestamp);
    }

    function withdraw() public {
        User storage user = users[msg.sender];
        require(user.checkpoint.add(TIME_STEP) < block.timestamp, "only once a day");
        uint256 totalAmount = getUserDividends(msg.sender);
        uint256 referralBonus = getUserReferralBonus(msg.sender);

        if (referralBonus > 0) {
            user.bonus = 0;
            totalAmount = totalAmount.add(referralBonus);
        }
        uint256 contractBalance = address(this).balance;
        if (contractBalance < totalAmount) {
            user.bonus = totalAmount.sub(contractBalance);
            totalAmount = contractBalance;
        }

        require(totalAmount >= WITHDRAW_MIN_AMOUNT, "withdraw min amount is not reached");

        if (user.deposits.length < 100) {
            uint256 reinvest_amount = totalAmount.mul(REINVEST_ON_WITHDRAWAL).div(PERCENTS_DIVIDER);
            totalAmount = totalAmount.sub(reinvest_amount);
            reinvestOnWithdraw(1, reinvest_amount);
        }

        user.checkpoint = block.timestamp;
        user.withdrawn = user.withdrawn.add(totalAmount);
        msg.sender.transfer(totalAmount);
        emit Withdrawn(msg.sender, totalAmount, block.timestamp);
    }

    function reinvest(uint8 plan) public {
        User storage user = users[msg.sender];
        (uint256 totalAmount1, uint256 totalAmount2) = getUserDividendsOnReinvest(msg.sender);
        if (totalAmount2 > 0 && plan == 1) {
            totalAmount2 = totalAmount2.add(totalAmount2.mul(REINVEST_BONUS).div(PERCENTS_DIVIDER));
        }
        uint256 totalAmount = totalAmount1.add(totalAmount2);
        uint256 referralBonus = getUserReferralBonus(msg.sender);
        if (referralBonus > 0) {
            user.bonus = 0;
            totalAmount = totalAmount.add(referralBonus);
        }
        require(block.timestamp > startDate, "contract does not launch yet");
        require(totalAmount >= INVEST_MIN_AMOUNT, "invest min amount is not reached");
        require(plan < 2, "Invalid plan");
        require(user.deposits.length < 100, "Max 100 deposits per address");

        uint256 reinvest_dFee = totalAmount.mul(REINVEST_DEV_FEE).div(PERCENTS_DIVIDER);
        devWallet.transfer(reinvest_dFee);
        emit FeePaid(msg.sender, reinvest_dFee);

        user.deposits.push(Deposit(plan, totalAmount, block.timestamp));
        totalInvested = totalInvested.add(totalAmount);
        user.checkpoint = block.timestamp;
        user.withdrawn = user.withdrawn.add(totalAmount);
        emit NewDeposit(msg.sender, plan, totalAmount, block.timestamp);
    }

    function reinvestOnWithdraw(uint8 plan, uint256 amount) private {
        User storage user = users[msg.sender];
        uint256 bonusAmount = amount.mul(REINVEST_BONUS).div(PERCENTS_DIVIDER);
        uint256 totalAmount = amount.add(bonusAmount);

        uint256 reinvest_dFee = totalAmount.mul(REINVEST_DEV_FEE).div(PERCENTS_DIVIDER);
        devWallet.transfer(reinvest_dFee);
        emit FeePaid(msg.sender, reinvest_dFee);

        user.deposits.push(Deposit(plan, totalAmount, block.timestamp));
        totalInvested = totalInvested.add(totalAmount);
        user.checkpoint = block.timestamp;
        user.withdrawn = user.withdrawn.add(totalAmount);
        emit NewDeposit(msg.sender, plan, totalAmount, block.timestamp);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getPlanInfo(uint8 plan) public view returns(uint256 time, uint256 percent) {
        time = plans[plan].time;
        percent = plans[plan].percent;
    }

    function getUserDividends(address userAddress) public view returns (uint256) {
        User storage user = users[userAddress];
        uint256 totalAmount;
        for (uint256 i = 0; i < user.deposits.length; i++) {
            uint256 finish = user.deposits[i].start.add(plans[user.deposits[i].plan].time.mul(TIME_STEP));
            if (user.checkpoint < finish) {
                uint256 share = user.deposits[i].amount.mul(plans[user.deposits[i].plan].percent).div(PERCENTS_DIVIDER);
                uint256 from = user.deposits[i].start > user.checkpoint ? user.deposits[i].start : user.checkpoint;
                uint256 to = finish < block.timestamp ? finish : block.timestamp;
                if (from < to) {
                    totalAmount = totalAmount.add(share.mul(to.sub(from)).div(TIME_STEP));
                }
            }
        }
        return totalAmount;
    }

    function getUserDividendsOnReinvest(address userAddress) public view returns (uint256, uint256) {
        User storage user = users[userAddress];
        uint256 totalAmount1;
        uint256 totalAmount2;
        for (uint256 i = 0; i < user.deposits.length; i++) {
            uint256 finish = user.deposits[i].start.add(plans[user.deposits[i].plan].time.mul(TIME_STEP));
            if (user.checkpoint < finish) {
                uint256 share = user.deposits[i].amount.mul(plans[user.deposits[i].plan].percent).div(PERCENTS_DIVIDER);
                uint256 from = user.deposits[i].start > user.checkpoint ? user.deposits[i].start : user.checkpoint;
                uint256 to = finish < block.timestamp ? finish : block.timestamp;
                if (from < to) {
                    if (user.deposits[i].plan == 0) {
                        totalAmount1 = totalAmount1.add(share.mul(to.sub(from)).div(TIME_STEP));
                    } else {
                        totalAmount2 = totalAmount2.add(share.mul(to.sub(from)).div(TIME_STEP));
                    }
                }
            }
        }
        return (totalAmount1, totalAmount2);
    }

    function getUserCheckpoint(address userAddress) public view returns(uint256) {
        return users[userAddress].checkpoint;
    }

    function getUserReferrer(address userAddress) public view returns(address) {
        return users[userAddress].referrer;
    }

    function getUserDownlineCount(address userAddress) public view returns(uint256, uint256, uint256) {
        return (users[userAddress].levels[0], users[userAddress].levels[1], users[userAddress].levels[2]);
    }

    function getUserReferralBonus(address userAddress) public view returns(uint256) {
        return users[userAddress].bonus;
    }

    function getUserReferralTotalBonus(address userAddress) public view returns(uint256) {
        return users[userAddress].totalBonus;
    }

    function getUserReferralWithdrawn(address userAddress) public view returns(uint256) {
        return users[userAddress].totalBonus.sub(users[userAddress].bonus);
    }

    function getUserAvailable(address userAddress) public view returns(uint256) {
        return getUserReferralBonus(userAddress).add(getUserDividends(userAddress));
    }

    function getUserAmountOfDeposits(address userAddress) public view returns(uint256) {
        return users[userAddress].deposits.length;
    }

    function getUserTotalDeposits(address userAddress) public view returns(uint256 amount) {
        for (uint256 i = 0; i < users[userAddress].deposits.length; i++) {
            amount = amount.add(users[userAddress].deposits[i].amount);
        }
    }

    function getUserDepositInfo(address userAddress, uint256 index) public view returns(uint8 plan, uint256 percent, uint256 amount, uint256 start, uint256 finish) {
        User storage user = users[userAddress];
        plan = user.deposits[index].plan;
        percent = plans[user.deposits[index].plan].percent;
        amount = user.deposits[index].amount;
        start = user.deposits[index].start;
        finish = user.deposits[index].start.add(plans[user.deposits[index].plan].time.mul(TIME_STEP));
    }

    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }
}

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0);
        uint256 c = a / b;
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;
        return c;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);
        return c;
    }
}
