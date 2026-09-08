// One-time/idempotent seed script for filler discussion topics, posts, and
// resources ahead of real content from the HR team. Safe to re-run: it skips
// anything that already exists (matched by email/name/title) instead of
// duplicating it.
//
// Usage: MONGODB_URI=... node server/seed.js   (or rely on a local .env)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Topic from './models/Topic.js';
import Post from './models/Post.js';
import Resource from './models/Resource.js';

dotenv.config();

const SEED_PASSWORD = 'SeedUser123!';

const SEED_USERS = [
  {
    key: 'community',
    name: 'Community Team',
    email: 'seed.community@example.com',
    password: SEED_PASSWORD,
    age: 30,
    caregiverType: 'parent',
    familyInfo: { numberOfKids: 1, kidsAgeGroups: ['4-6'], additionalInfo: 'Platform account for official announcements and curated resources.' },
    admin: true,
    showLocation: false,
  },
  {
    key: 'maria',
    name: 'Maria Gonzalez',
    alias: 'Maria G.',
    email: 'seed.maria@example.com',
    password: SEED_PASSWORD,
    age: 34,
    caregiverType: 'parent',
    familyInfo: { numberOfKids: 2, kidsAgeGroups: ['0-3', '4-6'] },
  },
  {
    key: 'james',
    name: 'James Thompson',
    alias: 'James T.',
    email: 'seed.james@example.com',
    password: SEED_PASSWORD,
    age: 41,
    caregiverType: 'guardian',
    familyInfo: { numberOfKids: 1, kidsAgeGroups: ['13-18'] },
  },
  {
    key: 'aisha',
    name: 'Aisha Rahman',
    alias: 'Aisha R.',
    email: 'seed.aisha@example.com',
    password: SEED_PASSWORD,
    age: 29,
    caregiverType: 'parent',
    familyInfo: { numberOfKids: 2, kidsAgeGroups: ['0-3', '4-6'] },
  },
  {
    key: 'david',
    name: 'David Kim',
    alias: 'David K.',
    email: 'seed.david@example.com',
    password: SEED_PASSWORD,
    age: 58,
    caregiverType: 'grandparent',
    familyInfo: { numberOfKids: 1, kidsAgeGroups: ['13-18'], additionalInfo: 'Raising my grandson full-time.' },
  },
];

const SEED_TOPICS = [
  {
    name: 'New Parent Support',
    description: 'For parents navigating pregnancy through the first year — sleep, feeding, and everything in between.',
    posts: [
      {
        author: 'aisha',
        content: "My daughter just turned 3 months and I still can't get more than a 3-hour stretch of sleep. Is this normal at this stage, or should I be worried? Would love to hear how others got through the fourth trimester without losing their minds.",
        replies: [
          { author: 'maria', content: "Totally normal — mine didn't sleep through the night until almost 5 months. Try shifting her last feed later and keeping the room dark for naps too, it helped us more than anything else." },
        ],
      },
      {
        author: 'maria',
        content: "Does anyone have a go-to routine for growth spurts? My son wants to eat constantly and I keep second-guessing whether he's actually hungry or just fussy.",
      },
    ],
  },
  {
    name: 'Single Parenting',
    description: "Balancing work, home, and everything solo. Share what's working (and what's not).",
    posts: [
      {
        author: 'james',
        content: "Since the divorce it's just been me and my daughter on weeknights. The hardest part isn't the logistics, it's not having anyone to tag out to when I'm running on empty. How do you all recharge without childcare backup?",
        replies: [
          { author: 'community', content: "A lot of single parents in this community swap 'emergency babysitting' hours with each other — even a 2-hour break once a week makes a difference. Feel free to post in Childcare & School Resources if you want to coordinate with someone nearby." },
        ],
      },
      {
        author: 'aisha',
        content: "Solo parenting a toddler while working full remote has been humbling. What's helped me most is batching meals on Sundays so weeknights aren't also a cooking crisis. Curious what other small systems people swear by.",
      },
    ],
  },
  {
    name: 'Co-Parenting & Custody',
    description: 'Communication, schedules, and staying consistent across two households.',
    posts: [
      {
        author: 'james',
        content: "We've been using a shared calendar app for pickups and it's cut our miscommunication way down. Still struggling with keeping bedtime and screen-time rules consistent between houses though — any tips?",
      },
      {
        author: 'david',
        content: "Raising my grandson while his parents work through a custody arrangement. Keeping routines steady across three households has been the biggest challenge. A written 'house rules' sheet we all agreed to upfront helped more than I expected.",
        replies: [
          { author: 'james', content: 'This is a great idea, might steal the house-rules-sheet approach for us too.' },
        ],
      },
    ],
  },
  {
    name: 'Caregiver Burnout & Self-Care',
    description: "You can't pour from an empty cup. A space to talk openly about stress, rest, and recovery.",
    posts: [
      {
        author: 'maria',
        content: 'I hit a wall last month — snapping at my kids over nothing and dreading things I used to enjoy. Turns out that was burnout, not just being tired. Therapy helped, but so did just admitting it out loud here.',
        replies: [
          { author: 'aisha', content: "Thank you for saying this. I think a lot of us are running on empty and don't realize it until something breaks." },
        ],
      },
      {
        author: 'david',
        content: "At 58, caregiving for a grandchild full-time is a different kind of tired than raising my own kids was. I've started taking one non-negotiable hour a day just for myself, even if it's just a walk.",
      },
    ],
  },
  {
    name: 'Financial Planning & Assistance',
    description: 'Budgeting tips, benefits programs, and financial aid for caregiving families.',
    posts: [
      {
        author: 'aisha',
        content: "Just found out about the Child and Dependent Care Credit at tax time and wish I'd known sooner. Are there other benefit programs people here have used that aren't well advertised?",
      },
      {
        author: 'james',
        content: "Childcare costs more than my mortgage some months. Looking into state subsidy programs now — if anyone's gone through that application process, I'd love to know what documentation actually sped things up.",
        replies: [
          { author: 'community', content: 'Check the Resources tab — Child Care Aware of America has a state-by-state directory of subsidy programs that’s a solid starting point.' },
        ],
      },
    ],
  },
  {
    name: 'Childcare & School Resources',
    description: "Finding daycare, navigating IEPs/504s, and getting the support your kid needs at school.",
    posts: [
      {
        author: 'maria',
        content: 'Our daycare waitlist is 8 months long in our area. Anyone had luck with in-home care co-ops or nanny-shares as a stopgap?',
      },
      {
        author: 'david',
        content: "Just got through my grandson's first IEP meeting. Bring a written list of questions — I froze up and forgot half of mine. Also ask for everything in writing afterward.",
        replies: [
          { author: 'aisha', content: 'Adding this to my notes for when we get there. Thank you for sharing!' },
        ],
      },
    ],
  },
  {
    name: 'Mental Health & Emotional Support',
    description: 'A judgment-free space to talk about anxiety, therapy, and emotional wellbeing.',
    posts: [
      {
        author: 'james',
        content: "Some days the guilt of not being 'enough' for my daughter is heavier than the actual parenting. Anyone else deal with that, or found a therapist who specializes in parent guilt and anxiety?",
      },
      {
        author: 'aisha',
        content: "Postpartum anxiety hit me harder than I expected with my second. Reaching out to Postpartum Support International's helpline was the first step that actually helped — sharing in case anyone needs it too.",
      },
    ],
  },
  {
    name: 'Parenting Teens',
    description: 'Curfews, screens, independence — figuring out the teenage years together.',
    posts: [
      {
        author: 'david',
        content: "My 15-year-old grandson wants more independence than I'm comfortable giving yet. Trying to find the balance between trust and safety — how do you all decide when to loosen the reins?",
        replies: [
          { author: 'james', content: 'We started with small, specific freedoms tied to responsibility — curfew extended by 30 minutes once he consistently texted when plans changed, that kind of thing.' },
        ],
      },
      {
        author: 'james',
        content: 'Screen time negotiations with my teenager feel like a full-time job. Setting a shared family agreement that she helped write cut the arguing down a lot.',
      },
    ],
  },
];

const SEED_RESOURCES = [
  {
    title: 'HealthyChildren.org (American Academy of Pediatrics)',
    url: 'https://www.healthychildren.org/',
    description: 'Parenting guidance from the American Academy of Pediatrics, covering everything from newborn care to teen health, backed by pediatric research.',
  },
  {
    title: 'Zero to Three',
    url: 'https://www.zerotothree.org/',
    description: 'Research-based resources on early childhood development, from birth through age three, including tips on sleep, feeding, and building secure attachment.',
  },
  {
    title: 'Child Mind Institute',
    url: 'https://childmind.org/',
    description: "Free guides and articles on children's mental health, from anxiety and ADHD to helping kids build emotional resilience.",
  },
  {
    title: 'National Alliance for Caregiving',
    url: 'https://www.caregiving.org/',
    description: 'Research and advocacy for family caregivers of all kinds, with reports and toolkits on caregiver wellbeing and support.',
  },
  {
    title: 'Child Care Aware of America',
    url: 'https://www.childcareaware.org/',
    description: 'Search tool and guidance for finding licensed childcare, plus a directory of state childcare subsidy and assistance programs.',
  },
  {
    title: 'Postpartum Support International',
    url: 'https://www.postpartum.net/',
    description: 'Support, resources, and a free helpline for parents experiencing postpartum depression, anxiety, or other perinatal mood disorders.',
  },
  {
    title: 'SAMHSA National Helpline',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    description: 'Free, confidential, 24/7 helpline (1-800-662-4357) for individuals and families facing mental health or substance use challenges.',
  },
  {
    title: 'National Domestic Violence Hotline',
    url: 'https://www.thehotline.org/',
    description: 'Confidential 24/7 support (1-800-799-7233) for anyone experiencing domestic violence, including safety planning resources for parents and children.',
  },
  {
    title: '211 — Find Local Help',
    url: 'https://www.211.org/',
    description: 'Dial 2-1-1 or search online to find local assistance with housing, food, childcare, utilities, and other essential needs.',
  },
  {
    title: 'AARP Family Caregiving',
    url: 'https://www.aarp.org/caregiving/',
    description: 'Practical guides for grandparents and family members raising or caring for children, including legal, financial, and emotional support resources.',
  },
];

async function seedUsers() {
  const idByKey = {};
  for (const u of SEED_USERS) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = new User({
        name: u.name,
        alias: u.alias || '',
        age: u.age,
        caregiverType: u.caregiverType,
        familyInfo: u.familyInfo,
        email: u.email,
        password: u.password,
        admin: Boolean(u.admin),
        showLocation: u.showLocation !== undefined ? u.showLocation : true,
      });
      await user.save();
      console.log(`Created seed user: ${u.name} <${u.email}>`);
    } else {
      console.log(`Seed user already exists, skipping: ${u.name} <${u.email}>`);
    }
    idByKey[u.key] = user;
  }
  return idByKey;
}

async function seedTopicsAndPosts(usersByKey) {
  for (const t of SEED_TOPICS) {
    let topic = await Topic.findOne({ name: t.name });
    if (!topic) {
      topic = new Topic({
        name: t.name,
        description: t.description,
        createdBy: usersByKey.community._id,
      });
      await topic.save();
      console.log(`Created topic: ${t.name}`);
    } else {
      console.log(`Topic already exists, skipping creation: ${t.name}`);
    }

    const existingPostCount = await Post.countDocuments({ topicName: topic.name });
    if (existingPostCount > 0) {
      console.log(`  Topic "${t.name}" already has posts, skipping post seeding.`);
      continue;
    }

    for (const p of t.posts) {
      const author = usersByKey[p.author];
      const replies = (p.replies || []).map((r) => {
        const replyAuthor = usersByKey[r.author];
        return {
          content: r.content,
          author: replyAuthor._id,
          authorName: replyAuthor.alias || replyAuthor.name,
        };
      });

      const post = new Post({
        content: p.content,
        author: author._id,
        authorName: author.alias || author.name,
        topic: topic._id,
        topicName: topic.name,
        replies,
      });
      await post.save();
      console.log(`  Added post by ${author.name} in "${t.name}"${replies.length ? ' (+ reply)' : ''}`);
    }
  }
}

async function seedResources(usersByKey) {
  for (const r of SEED_RESOURCES) {
    const existing = await Resource.findOne({ title: r.title });
    if (existing) {
      console.log(`Resource already exists, skipping: ${r.title}`);
      continue;
    }
    const resource = new Resource({
      title: r.title,
      url: r.url,
      description: r.description,
      createdBy: usersByKey.community._id,
    });
    await resource.save();
    console.log(`Created resource: ${r.title}`);
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'caregiver-app' });
  console.log('Connected to MongoDB. Seeding...\n');

  const usersByKey = await seedUsers();
  console.log('');
  await seedTopicsAndPosts(usersByKey);
  console.log('');
  await seedResources(usersByKey);

  console.log('\nDone. Seed admin login: seed.community@example.com / SeedUser123!');
  console.log('Rotate or remove seed accounts before onboarding real users.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
