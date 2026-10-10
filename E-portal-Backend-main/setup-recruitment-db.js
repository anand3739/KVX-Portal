const dotenv = require('dotenv');
dotenv.config();

const { query } = require('./src/config/database');

async function setupDatabase() {
  console.log("=================================================");
  console.log("   SETTING UP RECRUITMENT DATABASE TABLES IN POSTGRES ");
  console.log("=================================================");

  try {
    // 1. Update check constraint for status on job_applications table to accept review, interview, new, etc.
    await query(`
      ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;
      ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check 
        CHECK (status IN ('applied', 'new', 'review', 'shortlisted', 'interviewed', 'interview', 'offered', 'hired', 'rejected'));
    `);
    console.log("✅ Updated `job_applications_status_check` constraint.");

    // 2. Create interviews table
    await query(`
      CREATE TABLE IF NOT EXISTS interviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
          job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
          candidate_name VARCHAR(255) NOT NULL,
          candidate_email VARCHAR(255),
          job_title VARCHAR(255),
          interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
          interview_time VARCHAR(50) DEFAULT '10:00 AM',
          interview_type VARCHAR(100) DEFAULT 'Technical',
          interviewer_name VARCHAR(255) DEFAULT 'HR Manager',
          interviewer_id UUID REFERENCES employees(id),
          meeting_link TEXT,
          status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'cancelled')),
          feedback TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ `interviews` table ensured in PostgreSQL.");

    // 3. Check if job_postings has records. If 0, seed default sample jobs
    const jobsRes = await query("SELECT COUNT(*) FROM job_postings");
    if (parseInt(jobsRes.rows[0].count) === 0) {
      console.log("Seeding sample job postings...");
      const hrUserRes = await query("SELECT id FROM employees WHERE role IN ('hr', 'admin') LIMIT 1");
      const hrId = hrUserRes.rows[0]?.id || null;

      const sampleJobs = [
        { title: "Senior Software Engineer", dept: "Engineering", location: "New York, NY", type: "Full-time", salMin: 120000, salMax: 150000, desc: "Lead full-stack engineering initiatives using modern web tech and PostgreSQL." },
        { title: "HR Business Partner", dept: "Human Resources", location: "Remote", type: "Full-time", salMin: 85000, salMax: 105000, desc: "Drive employee engagement, talent acquisition, and performance review cycles." },
        { title: "Marketing Manager", dept: "Marketing", location: "San Francisco, CA", type: "Full-time", salMin: 90000, salMax: 120000, desc: "Oversee brand strategy, growth campaigns, and content operations." },
        { title: "Product Designer", dept: "Product", location: "Remote", type: "Contract", salMin: 95000, salMax: 130000, desc: "Design elegant user experiences, high-fidelity wireframes, and design systems." }
      ];

      for (const j of sampleJobs) {
        await query(
          `INSERT INTO job_postings (title, location, employment_type, salary_min, salary_max, description, status, openings, created_by, published_date)
           VALUES ($1, $2, $3, $4, $5, $6, 'published', 2, $7, CURRENT_DATE)`,
          [j.title, j.location, j.type, j.salMin, j.salMax, j.desc, hrId]
        );
      }
      console.log("✅ Sample job postings seeded.");
    }

    // 4. Check if job_applications has records. If 0, seed sample applicants
    const appsRes = await query("SELECT COUNT(*) FROM job_applications");
    if (parseInt(appsRes.rows[0].count) === 0) {
      console.log("Seeding sample job applications...");
      const jobListings = await query("SELECT id, title FROM job_postings LIMIT 4");

      if (jobListings.rows.length > 0) {
        const j1 = jobListings.rows[0];
        const j2 = jobListings.rows[1] || j1;

        const sampleApps = [
          { jobId: j1.id, jobTitle: j1.title, first: "Alice", last: "Johnson", email: "alice.j@example.com", phone: "+1 (555) 123-4567", exp: 8, company: "TechCorp", status: "interviewed", rating: 5, feedback: "Excellent architectural background" },
          { jobId: j1.id, jobTitle: j1.title, first: "Bob", last: "Smith", email: "bob.smith@example.com", phone: "+1 (555) 234-5678", exp: 5, company: "SoftInc", status: "shortlisted", rating: 4, feedback: "Solid full-stack skill set" },
          { jobId: j2.id, jobTitle: j2.title, first: "Carol", last: "White", email: "carol.w@example.com", phone: "+1 (555) 345-6789", exp: 7, company: "Global HR", status: "applied", rating: 3, feedback: "Good candidate" },
          { jobId: j2.id, jobTitle: j2.title, first: "Emily", last: "Davis", email: "emily.d@example.com", phone: "+1 (555) 567-8901", exp: 6, company: "DesignStudio", status: "interviewed", rating: 5, feedback: "Outstanding portfolio" }
        ];

        for (const app of sampleApps) {
          const insertedApp = await query(
            `INSERT INTO job_applications (job_id, first_name, last_name, email, phone, experience_years, current_company, status, rating, feedback)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [app.jobId, app.first, app.last, app.email, app.phone, app.exp, app.company, app.status, app.rating, app.feedback]
          );

          if (app.status === 'interviewed') {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 2);
            await query(
              `INSERT INTO interviews (application_id, job_id, candidate_name, candidate_email, job_title, interview_date, interview_time, interview_type, interviewer_name, status)
               VALUES ($1, $2, $3, $4, $5, $6, '10:00 AM', 'Technical', 'Sarah Wilson', 'scheduled')`,
              [insertedApp.rows[0].id, app.jobId, `${app.first} ${app.last}`, app.email, app.jobTitle, futureDate]
            );
          }
        }
        console.log("✅ Sample job applications & interviews seeded.");
      }
    }

    console.log("=================================================");
    console.log("   RECRUITMENT DB SETUP COMPLETE! ");
    console.log("=================================================");
    process.exit(0);

  } catch (err) {
    console.error("Database setup error:", err);
    process.exit(1);
  }
}

setupDatabase();
