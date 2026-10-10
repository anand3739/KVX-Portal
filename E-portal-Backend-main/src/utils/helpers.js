const moment = require('moment');

const generateEmployeeId = async (query) => {
  const year = new Date().getFullYear();
  const result = await query(
    "SELECT COUNT(*) FROM employees WHERE employee_id LIKE $1",
    [`EMP${year}%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `EMP${year}${String(count).padStart(4, '0')}`;
};

const calculateLeaveDays = (startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'days') + 1;
};

const calculateWorkingHours = (loginTime, logoutTime) => {
  const login = moment(loginTime);
  const logout = moment(logoutTime);
  return logout.diff(login, 'hours', true);
};

const calculateOvertime = (totalHours, regularHours = 8) => {
  return totalHours > regularHours ? totalHours - regularHours : 0;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date, format = 'MMM DD, YYYY') => {
  return moment(date).format(format);
};

const calculateAge = (dateOfBirth) => {
  return moment().diff(moment(dateOfBirth), 'years');
};

const getFinancialYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month >= 4) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
};

const getMonthDays = (year, month) => {
  return moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
};

const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {
    data: data.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit)
    }
  };
  
  return results;
};

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
};

const maskPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

module.exports = {
  generateEmployeeId,
  calculateLeaveDays,
  calculateWorkingHours,
  calculateOvertime,
  formatCurrency,
  formatDate,
  calculateAge,
  getFinancialYear,
  getMonthDays,
  paginate,
  maskEmail,
  maskPhone
};