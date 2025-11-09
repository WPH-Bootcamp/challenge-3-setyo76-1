// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: Agustinus Setyo Nugroho
// KELAS: REP Batch 3
// TANGGAL: 9 November 2025
// ============================================

// TODO: Import module yang diperlukan
// HINT: readline, fs, path
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// TODO: Definisikan konstanta
// HINT: DATA_FILE, REMINDER_INTERVAL, DAYS_IN_WEEK
const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 detik
const DAYS_IN_WEEK = 7;

// TODO: Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================
// TODO: Buat object userProfile dengan properties:
// - name
// - joinDate
// - totalHabits
// - completedThisWeek
// TODO: Tambahkan method updateStats(habits)
// TODO: Tambahkan method getDaysJoined()
const userProfile = {
  name: 'User',
  joinDate: new Date(),
  totalHabits: 0,
  completedThisWeek: 0,

  // Method untuk update statistik
  updateStats: function (habits) {
    // KONSEP: filter()
    this.totalHabits = habits.length;
    this.completedThisWeek = habits.filter((h) =>
      h.isCompletedThisWeek()
    ).length;
  },

  // Method untuk menghitung hari bergabung
  getDaysJoined: function () {
    // KONSEP: Date
    const today = new Date();
    const diffTime = Math.abs(today - this.joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
};

// ============================================
// HABIT CLASS
// ============================================
// TODO: Buat class Habit dengan:
// - Constructor yang menerima name dan targetFrequency
// - Method markComplete()
// - Method getThisWeekCompletions()
// - Method isCompletedThisWeek()
// - Method getProgressPercentage()
// - Method getStatus()
class Habit {
  constructor(name, targetFrequency) {
    this.id = Date.now().toString(); // ID unik berdasarkan timestamp
    this.name = name;
    this.targetFrequency = targetFrequency; // Target per minggu
    this.completions = []; // Array of dates
    this.createdAt = new Date();
  }

  // Method untuk menandai habit selesai
  markComplete() {
    // KONSEP: Date, Array.some()
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cek jika sudah ditandai hari ini
    const alreadyCompleted = this.completions.some((date) => {
      const completionDate = new Date(date);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === today.getTime();
    });

    if (!alreadyCompleted) {
      this.completions.push(today);
      return true;
    }
    return false;
  }

  // Method untuk mendapatkan penyelesaian minggu ini
  getThisWeekCompletions() {
    // KONSEP: Date, filter()
    const today = new Date();
    // Mendapatkan hari pertama minggu (Minggu)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return this.completions.filter((date) => {
      const completionDate = new Date(date);
      return completionDate >= startOfWeek;
    });
  }

  // Method untuk cek apakah sudah selesai minggu ini
  isCompletedThisWeek() {
    return this.getThisWeekCompletions().length >= this.targetFrequency;
  }

  // Method untuk mendapatkan persentase progress
  getProgressPercentage() {
    const completions = this.getThisWeekCompletions().length;
    return Math.min(
      100,
      Math.round((completions / this.targetFrequency) * 100)
    );
  }

  // Method untuk mendapatkan status
  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }
}

// ============================================
// HABIT TRACKER CLASS
// ============================================
// TODO: Buat class HabitTracker dengan:
// [Semua method yang diminta]
class HabitTracker {
  constructor() {
    this.habits = [];
    this.reminderInterval = null;
    this.loadFromFile();
  }

  // CRUD Operations

  // Method untuk menambah habit baru
  addHabit(name, frequency) {
    const habit = new Habit(name, frequency);
    this.habits.push(habit); // KONSEP: Array
    this.saveToFile();
    return habit;
  }

  // Method untuk menandai habit selesai
  completeHabit(habitIndex) {
    // KONSEP: Nullish coalescing operator (??)
    const habit = this.habits[habitIndex - 1] ?? null;
    if (habit) {
      const success = habit.markComplete();
      if (success) {
        this.saveToFile();
        return true;
      }
    }
    return false;
  }

  // Method untuk menghapus habit
  deleteHabit(habitIndex) {
    if (habitIndex > 0 && habitIndex <= this.habits.length) {
      this.habits.splice(habitIndex - 1, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }

  // Display Methods

  // Method untuk menampilkan profil
  displayProfile() {
    userProfile.updateStats(this.habits);
    console.log('\n==================================================');
    console.log('USER PROFILE');
    console.log('==================================================');
    console.log(`Name: ${userProfile.name}`);
    console.log(`Member Since: ${userProfile.joinDate.toLocaleDateString()}`);
    console.log(`Days Joined: ${userProfile.getDaysJoined()} days`);
    console.log(`Total Habits: ${userProfile.totalHabits}`);
    console.log(`Completed This Week: ${userProfile.completedThisWeek}`);
    console.log('==================================================\n');
  }

  // Method untuk menampilkan habits dengan filter
  displayHabits(filter = 'all') {
    let filteredHabits = [];

    // KONSEP: filter()
    if (filter === 'active') {
      filteredHabits = this.habits.filter((h) => !h.isCompletedThisWeek());
    } else if (filter === 'completed') {
      filteredHabits = this.habits.filter((h) => h.isCompletedThisWeek());
    } else {
      filteredHabits = this.habits;
    }

    if (filteredHabits.length === 0) {
      console.log('\nTidak ada kebiasaan untuk ditampilkan.\n');
      return;
    }

    console.log('\n==================================================');
    console.log(`DAFTAR KEBIASAAN (${filter.toUpperCase()})`);
    console.log('==================================================');

    // KONSEP: forEach()
    filteredHabits.forEach((habit, index) => {
      const originalIndex = this.habits.indexOf(habit) + 1;
      const progress = habit.getProgressPercentage();
      const progressBar = this.createProgressBar(progress);

      console.log(`${originalIndex}. [${habit.getStatus()}] ${habit.name}`);
      console.log(`   Target: ${habit.targetFrequency}x/minggu`);
      console.log(
        `   Progress: ${habit.getThisWeekCompletions().length}/${
          habit.targetFrequency
        } (${progress}%)`
      );
      console.log(`   Progress Bar: ${progressBar}`);
      console.log('');
    });

    console.log('==================================================\n');
  }

  // Method untuk menampilkan habits dengan while loop
  displayHabitsWithWhile() {
    console.log('\n==================================================');
    console.log('DEMO WHILE LOOP - MENAMPILKAN KEBIASAAN');
    console.log('==================================================');

    // KONSEP: while loop
    let i = 0;
    while (i < this.habits.length) {
      const habit = this.habits[i];
      const progress = habit.getProgressPercentage();

      console.log(`${i + 1}. [${habit.getStatus()}] ${habit.name}`);
      console.log(
        `   Progress: ${habit.getThisWeekCompletions().length}/${
          habit.targetFrequency
        } (${progress}%)`
      );
      console.log('');

      i++;
    }

    console.log('==================================================\n');
  }

  // Method untuk menampilkan habits dengan for loop
  displayHabitsWithFor() {
    console.log('\n==================================================');
    console.log('DEMO FOR LOOP - MENAMPILKAN KEBIASAAN');
    console.log('==================================================');

    // KONSEP: for loop
    for (let i = 0; i < this.habits.length; i++) {
      const habit = this.habits[i];
      const progress = habit.getProgressPercentage();

      console.log(`${i + 1}. [${habit.getStatus()}] ${habit.name}`);
      console.log(
        `   Progress: ${habit.getThisWeekCompletions().length}/${
          habit.targetFrequency
        } (${progress}%)`
      );
      console.log('');
    }

    console.log('==================================================\n');
  }

  // Method untuk menampilkan statistik
  displayStats() {
    console.log('\n==================================================');
    console.log('STATISTIK KEBIASAAN');
    console.log('==================================================');

    // Total habits
    console.log(`Total Kebiasaan: ${this.habits.length}`);

    // Active habits (KONSEP: filter())
    const activeHabits = this.habits.filter((h) => !h.isCompletedThisWeek());
    console.log(`Kebiasaan Aktif: ${activeHabits.length}`);

    // Completed habits (KONSEP: filter())
    const completedHabits = this.habits.filter((h) => h.isCompletedThisWeek());
    console.log(`Kebiasaan Selesai: ${completedHabits.length}`);

    // Most frequent habit (KONSEP: Array.reduce())
    if (this.habits.length > 0) {
      const mostFrequent = this.habits.reduce((prev, current) =>
        prev.getThisWeekCompletions().length >
        current.getThisWeekCompletions().length
          ? prev
          : current
      );

      console.log(
        `Kebiasaan Terbanyak: ${mostFrequent.name} (${
          mostFrequent.getThisWeekCompletions().length
        } kali)`
      );
    }

    // All habit names using map (KONSEP: map())
    const habitNames = this.habits.map((h) => h.name);
    console.log(`Daftar Kebiasaan: ${habitNames.join(', ')}`);

    console.log('==================================================\n');
  }

  // KONSEP BARU: Implementasi find()
  findHabitByName(name) {
    // KONSEP: find()
    return this.habits.find((h) => h.name.toLowerCase() === name.toLowerCase());
  }

  // Reminder System

  // Method untuk memulai reminder
  startReminder() {
    // KONSEP: setInterval
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }

    this.reminderInterval = setInterval(() => {
      this.showReminder();
    }, REMINDER_INTERVAL);
  }

  // Method untuk menampilkan reminder
  showReminder() {
    const activeHabits = this.habits.filter((h) => !h.isCompletedThisWeek());

    if (activeHabits.length > 0) {
      const randomHabit =
        activeHabits[Math.floor(Math.random() * activeHabits.length)];
      // Pindahkan kursor ke baris baru dan cetak
      readline.cursorTo(process.stdout, 0);
      console.log('\n==================================================');
      console.log(`REMINDER: Jangan lupa "${randomHabit.name}"!`);
      console.log('==================================================\n');
    }
  }

  // Method untuk menghentikan reminder
  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }

  // File Operations

  // Method untuk menyimpan data ke file
  saveToFile() {
    // KONSEP: JSON.stringify
    try {
      const data = {
        userProfile: userProfile,
        habits: this.habits,
      };

      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(DATA_FILE, jsonData);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  // Method untuk memuat data dari file
  loadFromFile() {
    // KONSEP: JSON.parse
    try {
      if (fs.existsSync(DATA_FILE)) {
        const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(jsonData);

        // Load user profile
        if (data.userProfile) {
          Object.assign(userProfile, data.userProfile);
          userProfile.joinDate = new Date(userProfile.joinDate);
        }

        // Load habits
        if (data.habits && Array.isArray(data.habits)) {
          // KONSEP: map() untuk re-instantiate Object dari JSON
          this.habits = data.habits.map((habitData) => {
            // KONSEP: Nullish coalescing operator (??) untuk nilai default
            const habit = new Habit(
              habitData.name ?? 'Unnamed Habit',
              habitData.targetFrequency ?? 1
            );

            habit.id = habitData.id;
            habit.createdAt = new Date(habitData.createdAt);
            // KONSEP: map() + Date
            habit.completions = habitData.completions.map(
              (date) => new Date(date)
            );

            return habit;
          });
        }

        return true;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    return false;
  }

  // Method untuk menghapus semua data
  clearAllData() {
    this.habits = [];
    userProfile.name = 'User';
    userProfile.joinDate = new Date();
    userProfile.totalHabits = 0;
    userProfile.completedThisWeek = 0;

    try {
      if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
      }
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Helper Method untuk membuat progress bar
  createProgressBar(percentage) {
    const barLength = 10;
    const filledLength = Math.round((percentage / 100) * barLength);
    const emptyLength = barLength - filledLength;

    return (
      '█'.repeat(filledLength) + '░'.repeat(emptyLength) + ` ${percentage}%`
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
// TODO: Buat function askQuestion(question)
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// TODO: Buat function displayMenu()
function displayMenu() {
  console.log('\n==================================================');
  console.log('HABIT TRACKER - MAIN MENU');
  console.log('==================================================');
  console.log('1. Lihat Profil');
  console.log('2. Lihat Semua Kebiasaan');
  console.log('3. Lihat Kebiasaan Aktif');
  console.log('4. Lihat Kebiasaan Selesai');
  console.log('5. Tambah Kebiasaan Baru');
  console.log('6. Tandai Kebiasaan Selesai');
  console.log('7. Hapus Kebiasaan');
  console.log('8. Lihat Statistik');
  console.log('9. Demo Array Methods (while/for/find/reduce)'); // Menu 9 disesuaikan
  console.log('0. Keluar');
  console.log('==================================================');
}

// Tambahkan demonstrasi find() dan reduce()
async function demoArrayMethods(tracker) {
  console.log('\n==================================================');
  console.log('DEMO ARRAY METHODS');
  console.log('==================================================');

  // 1. Demo Find()
  const searchName = await askQuestion('Cari kebiasaan berdasarkan nama: ');
  const foundHabit = tracker.findHabitByName(searchName); // KONSEP: find()

  if (foundHabit) {
    console.log(
      `✅ Ditemukan: ${foundHabit.name} - Status: ${foundHabit.getStatus()}`
    );
  } else {
    console.log(`❌ Kebiasaan dengan nama "${searchName}" tidak ditemukan.`);
  }

  console.log('---');

  // 2. Demo While/For Loop
  const loopType = await askQuestion(
    'Pilih tipe loop untuk menampilkan semua kebiasaan (1: while, 2: for): '
  );
  if (loopType === '1') {
    tracker.displayHabitsWithWhile();
  } else if (loopType === '2') {
    tracker.displayHabitsWithFor();
  } else {
    console.log('\nPilihan loop tidak valid.\n');
  }

  // 3. Demo Reduce (sudah ada di displayStats, ditampilkan lagi untuk penekanan)
  if (tracker.habits.length > 0) {
    const mostFrequent = tracker.habits.reduce((prev, current) =>
      prev.getThisWeekCompletions().length >
      current.getThisWeekCompletions().length
        ? prev
        : current
    ); // KONSEP: reduce()
    console.log('---');
    console.log(
      `💡 Demo Reduce(): Kebiasaan yang paling sering diselesaikan minggu ini: ${mostFrequent.name}`
    );
  }

  console.log('==================================================\n');
}

// TODO: Buat async function handleMenu(tracker)
async function handleMenu(tracker) {
  let running = true;

  while (running) {
    displayMenu();
    const choice = await askQuestion('Pilih menu (0-9): ');

    switch (choice) {
      case '1':
        tracker.displayProfile();
        break;

      case '2':
        tracker.displayHabits('all');
        break;

      case '3':
        tracker.displayHabits('active');
        break;

      case '4':
        tracker.displayHabits('completed');
        break;

      case '5':
        const name = await askQuestion('Nama kebiasaan: ');
        // KONSEP: Nullish coalescing operator (??)
        const frequency =
          parseInt(await askQuestion('Target per minggu: ')) || 1;
        tracker.addHabit(name, frequency);
        console.log(`\nKebiasaan "${name}" berhasil ditambahkan!\n`);
        break;

      case '6':
        tracker.displayHabits('active');
        if (tracker.habits.length > 0) {
          const habitIndex = parseInt(
            await askQuestion('Pilih nomor kebiasaan: ')
          );
          if (tracker.completeHabit(habitIndex)) {
            console.log('\nKebiasaan berhasil ditandai selesai!\n');
          } else {
            console.log(
              '\nGagal menandai kebiasaan. Pastikan nomor valid dan belum ditandai hari ini.\n'
            );
          }
        }
        break;

      case '7':
        tracker.displayHabits('all');
        if (tracker.habits.length > 0) {
          const habitIndex = parseInt(
            await askQuestion('Pilih nomor kebiasaan yang akan dihapus: ')
          );
          if (tracker.deleteHabit(habitIndex)) {
            console.log('\nKebiasaan berhasil dihapus!\n');
          } else {
            console.log('\nGagal menghapus kebiasaan. Pastikan nomor valid.\n');
          }
        }
        break;

      case '8':
        tracker.displayStats();
        break;

      case '9':
        await demoArrayMethods(tracker); // Memanggil fungsi demo yang baru
        break;

      case '0':
        running = false;
        tracker.stopReminder();
        console.log(
          '\nTerima kasih telah menggunakan Habit Tracker CLI. Sampai jumpa!\n'
        );
        break;

      default:
        console.log('\nPilihan tidak valid. Silakan coba lagi.\n');
    }
  }

  rl.close();
}

// ============================================
// MAIN FUNCTION
// ============================================
// TODO: Buat async function main()
async function main() {
  // Tampilkan banner
  console.log('\n==================================================');
  console.log('   HABIT TRACKER CLI - APLIKASI PELACAK KEBIASAAN');
  console.log('==================================================');
  console.log('Selamat datang di aplikasi pelacak kebiasaan harian Anda!');
  console.log('Aplikasi ini akan membantu Anda memantau dan menjaga');
  console.log('konsistensi kebiasaan positif dalam kehidupan sehari-hari.');
  console.log('==================================================\n');

  // Buat instance HabitTracker
  const tracker = new HabitTracker();

  // Tambah data demo jika tidak ada data
  if (tracker.habits.length === 0) {
    tracker.addHabit('Minum Air 8 Gelas', 7);
    tracker.addHabit('Olahraga 30 Menit', 5);
    tracker.addHabit('Membaca 20 Halaman', 4);
    tracker.addHabit('Meditasi 10 Menit', 6);

    console.log('Data demo telah ditambahkan untuk memulai.\n');
  }

  // Mulai reminder
  tracker.startReminder();

  // Panggil handleMenu
  await handleMenu(tracker);
}

// TODO: Jalankan main() dengan error handling
main().catch((error) => {
  console.error('Terjadi kesalahan fatal:', error);
  rl.close();
});
