const { randomUUID } = require('crypto')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { getDocClient } = require('../src/lib/dynamo')

const USER_IDS = [
  'seed.ames.local',
  'seller.market.local',
  'classifieds.demo.local'
]

const CATEGORY_FIXTURES = {
  'For Sale': {
    'Cars + Trucks': [
      {
        title: '2016 Honda Civic LX',
        year: '2016',
        make: 'Honda',
        model: 'Civic LX',
        color: 'Silver',
        condition: 'Good',
        mileage: '84210',
        price: '12900',
        description: 'Clean commuter sedan with cold AC, backup camera, and new front brakes.',
        city: 'Ames',
        phone: '515-555-0101'
      },
      {
        title: '2018 Ford F-150 XLT',
        year: '2018',
        make: 'Ford',
        model: 'F-150 XLT',
        color: 'Blue',
        condition: 'Very Good',
        mileage: '66400',
        price: '24400',
        description: 'Crew cab pickup with tow package, spray-in bed liner, and remote start.',
        city: 'Boone',
        phone: '515-555-0102'
      },
      {
        title: '2014 Subaru Outback Premium',
        year: '2014',
        make: 'Subaru',
        model: 'Outback Premium',
        color: 'Green',
        condition: 'Good',
        mileage: '109330',
        price: '9800',
        description: 'All-wheel drive wagon with roof rails, heated seats, and recent tires.',
        city: 'Nevada',
        phone: '515-555-0103'
      }
    ],
    Motorcycles: [
      {
        title: '2019 Yamaha MT-07',
        year: '2019',
        make: 'Yamaha',
        model: 'MT-07',
        color: 'Black',
        condition: 'Excellent',
        mileage: '8120',
        price: '6900',
        description: 'Nimble naked bike with frame sliders, fresh service, and clean title.',
        city: 'Ames',
        phone: '515-555-0104'
      },
      {
        title: '2017 Kawasaki Ninja 650',
        year: '2017',
        make: 'Kawasaki',
        model: 'Ninja 650',
        color: 'Green',
        condition: 'Very Good',
        mileage: '12640',
        price: '6200',
        description: 'Well-kept sport touring setup with tank bag, ABS, and new battery.',
        city: 'Ankeny',
        phone: '515-555-0105'
      },
      {
        title: '2015 Harley-Davidson Street 750',
        year: '2015',
        make: 'Harley-Davidson',
        model: 'Street 750',
        color: 'Red',
        condition: 'Good',
        mileage: '15450',
        price: '4700',
        description: 'Easy first cruiser with forward controls, windshield, and garage-kept finish.',
        city: 'Des Moines',
        phone: '515-555-0106'
      }
    ],
    Boats: [
      {
        title: '2012 Tracker Pro Team 175',
        yearBuilt: '2012',
        makeModel: 'Tracker Pro Team 175',
        color: 'White',
        type: 'Fishing Boat',
        condition: 'Good',
        price: '8900',
        description: '17-foot aluminum fishing boat with trailer, trolling motor, and depth finder.',
        city: 'Ames',
        phone: '515-555-0107'
      },
      {
        title: '2008 Sea Ray 185 Sport',
        yearBuilt: '2008',
        makeModel: 'Sea Ray 185 Sport',
        color: 'White and Blue',
        type: 'Bowrider',
        condition: 'Very Good',
        price: '14900',
        description: 'Family runabout with bimini top, snap cover, and serviced MerCruiser engine.',
        city: 'West Des Moines',
        phone: '515-555-0108'
      },
      {
        title: '2016 Old Town Vapor 10',
        yearBuilt: '2016',
        makeModel: 'Old Town Vapor 10',
        color: 'Orange',
        type: 'Kayak',
        condition: 'Excellent',
        price: '550',
        description: 'Stable recreational kayak with paddle, seat cushion, and storage hatch.',
        city: 'Story City',
        phone: '515-555-0109'
      }
    ],
    Books: [
      {
        title: 'Calculus Early Transcendentals',
        author: 'James Stewart',
        subject: 'Mathematics',
        condition: 'Used - Good',
        edition: '8th',
        isbn: '9781285741550',
        price: '65',
        description: 'Used college calculus textbook with clean pages and minimal highlighting.',
        city: 'Ames',
        phone: '515-555-0110'
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Cormen, Leiserson, Rivest, Stein',
        subject: 'Computer Science',
        condition: 'Used - Very Good',
        edition: '3rd',
        isbn: '9780262033848',
        price: '72',
        description: 'Classic algorithms reference with dust jacket and no missing pages.',
        city: 'Ames',
        phone: '515-555-0111'
      },
      {
        title: 'Organic Chemistry',
        author: 'Paula Yurkanis Bruice',
        subject: 'Chemistry',
        condition: 'Used - Acceptable',
        edition: '7th',
        isbn: '9780321803221',
        price: '40',
        description: 'Affordable orgo text with margin notes, perfect for study use.',
        city: 'Marshalltown',
        phone: '515-555-0112'
      }
    ],
    Furniture: [
      {
        title: 'Mid-Century Walnut Desk',
        item: 'Writing Desk',
        material: 'Walnut Veneer',
        color: 'Brown',
        condition: 'Very Good',
        dimensions: '48x24x30 in',
        brand: 'Lane',
        price: '280',
        description: 'Compact desk with three drawers, tapered legs, and warm walnut finish.',
        city: 'Ames',
        phone: '515-555-0113'
      },
      {
        title: 'Gray Sectional Sofa',
        item: 'Sectional Couch',
        material: 'Fabric',
        color: 'Gray',
        condition: 'Good',
        dimensions: '96x64x34 in',
        brand: 'Ashley',
        price: '425',
        description: 'Large sectional with reversible chaise and removable cushion covers.',
        city: 'Huxley',
        phone: '515-555-0114'
      },
      {
        title: 'Solid Oak Dining Set',
        item: 'Dining Table Set',
        material: 'Oak',
        color: 'Natural',
        condition: 'Excellent',
        dimensions: '60x36x30 in',
        brand: 'Ethan Allen',
        price: '640',
        description: 'Table plus four chairs, solid oak construction, and lightly used finish.',
        city: 'Ames',
        phone: '515-555-0115'
      }
    ]
  },
  Housing: {
    Apartments: [
      {
        title: 'Sunny 2BR Near Campus',
        bedrooms: '2',
        bathrooms: '1',
        sqft: '840',
        rent: '1125',
        deposit: '1125',
        petsAllowed: 'Yes',
        available: '2026-06-01',
        description: 'Top-floor apartment with updated kitchen, on-site laundry, and easy campus access.',
        city: 'Ames',
        phone: '515-555-0116'
      },
      {
        title: 'Modern 1BR Downtown Loft',
        bedrooms: '1',
        bathrooms: '1',
        sqft: '690',
        rent: '980',
        deposit: '980',
        petsAllowed: 'No',
        available: '2026-05-15',
        description: 'Open-concept loft with exposed brick, reserved parking, and secure entry.',
        city: 'Des Moines',
        phone: '515-555-0117'
      },
      {
        title: 'Spacious 3BR with Balcony',
        bedrooms: '3',
        bathrooms: '2',
        sqft: '1180',
        rent: '1395',
        deposit: '1200',
        petsAllowed: 'Yes',
        available: '2026-07-01',
        description: 'Three-bedroom unit with balcony, dishwasher, and bus stop right outside.',
        city: 'Ames',
        phone: '515-555-0118'
      }
    ],
    Houses: [
      {
        title: 'Updated Ranch on Corner Lot',
        bedrooms: '3',
        bathrooms: '2',
        sqft: '1540',
        price: '279900',
        garage: '2-car attached',
        yearBuilt: '1998',
        description: 'Move-in-ready ranch with fenced yard, finished basement, and new roof.',
        city: 'Ames',
        phone: '515-555-0119'
      },
      {
        title: 'Historic Home Near Downtown',
        bedrooms: '4',
        bathrooms: '2.5',
        sqft: '2160',
        price: '335000',
        garage: '1-car detached',
        yearBuilt: '1924',
        description: 'Character home with hardwood floors, sunroom, and renovated kitchen.',
        city: 'Boone',
        phone: '515-555-0120'
      },
      {
        title: 'Newer Split-Level with Deck',
        bedrooms: '3',
        bathrooms: '3',
        sqft: '1825',
        price: '314500',
        garage: '3-car attached',
        yearBuilt: '2011',
        description: 'Bright split-level home with open living room, large deck, and storage shed.',
        city: 'Ankeny',
        phone: '515-555-0121'
      }
    ],
    Rooms: [
      {
        title: 'Private Room in Quiet House',
        roomType: 'Private Bedroom',
        furnished: 'Yes',
        utilities: 'Yes',
        rent: '525',
        available: '2026-05-20',
        preferences: 'Looking for a clean grad student or young professional.',
        description: 'Single room in shared house with parking, laundry, and backyard patio.',
        city: 'Ames',
        phone: '515-555-0122'
      },
      {
        title: 'Basement Room with Bath',
        roomType: 'Basement Suite',
        furnished: 'No',
        utilities: 'Yes',
        rent: '650',
        available: '2026-06-10',
        preferences: 'No smoking and no overnight guests during weeknights.',
        description: 'Large lower-level room with private bathroom and shared kitchen upstairs.',
        city: 'Johnston',
        phone: '515-555-0123'
      },
      {
        title: 'Summer Sublet by Engineering',
        roomType: 'Sublet Bedroom',
        furnished: 'Yes',
        utilities: 'No',
        rent: '475',
        available: '2026-05-12',
        preferences: 'Ideal for internship housing through August.',
        description: 'Affordable furnished sublet within walking distance of campus engineering buildings.',
        city: 'Ames',
        phone: '515-555-0124'
      }
    ],
    Commercial: [
      {
        title: 'Retail Bay on Main Street',
        sqft: '1800',
        type: 'Retail',
        zoning: 'C-1',
        rent: '2400',
        available: 'Immediate',
        parking: 'Shared lot',
        description: 'Street-facing retail suite with open floor plan, stock room, and restroom.',
        city: 'Boone',
        phone: '515-555-0125'
      },
      {
        title: 'Flexible Office Suite',
        sqft: '950',
        type: 'Office',
        zoning: 'Commercial Office',
        rent: '1650',
        available: '2026-06-01',
        parking: 'Reserved spaces',
        description: 'Office suite with reception area, two private offices, and conference nook.',
        city: 'Ames',
        phone: '515-555-0126'
      },
      {
        title: 'Warehouse with Loading Door',
        sqft: '4200',
        type: 'Industrial',
        zoning: 'M-1',
        rent: '3900',
        available: '2026-07-15',
        parking: 'Ample on-site',
        description: 'Heated warehouse space with 12-foot overhead door and office mezzanine.',
        city: 'Nevada',
        phone: '515-555-0127'
      }
    ],
    Land: [
      {
        title: 'Buildable Acreage Outside Ames',
        acres: '4.8',
        zoning: 'Residential',
        utilities: 'Electric at road',
        price: '112000',
        access: 'Gravel road frontage',
        survey: 'Yes',
        description: 'Rolling acreage with open views and plenty of space for a custom home.',
        city: 'Ames',
        phone: '515-555-0128'
      },
      {
        title: 'Commercial Corner Lot',
        acres: '1.3',
        zoning: 'Highway Commercial',
        utilities: 'Water and sewer available',
        price: '189000',
        access: 'Paved corner access',
        survey: 'Yes',
        description: 'High-visibility lot near arterial road, suited for small retail or service use.',
        city: 'Ankeny',
        phone: '515-555-0129'
      },
      {
        title: 'Hunting and Recreation Parcel',
        acres: '22',
        zoning: 'Agricultural',
        utilities: 'None',
        price: '154500',
        access: 'Easement lane',
        survey: 'No',
        description: 'Mixed timber and grass parcel with creek edge and established deer trails.',
        city: 'State Center',
        phone: '515-555-0130'
      }
    ]
  },
  Services: {
    Automotive: [
      {
        title: 'Mobile Brake and Oil Service',
        serviceType: 'Brake jobs and oil changes',
        experience: '8 years',
        certifications: 'ASE G1',
        rate: '$90 per hour',
        availability: 'Evenings and weekends',
        mobile: 'Yes',
        description: 'Convenient driveway automotive service for maintenance and common repairs.',
        city: 'Ames',
        phone: '515-555-0131'
      },
      {
        title: 'Import Car Diagnostic Help',
        serviceType: 'Diagnostics and electrical troubleshooting',
        experience: '11 years',
        certifications: 'ASE A6 A8',
        rate: '$110 per hour',
        availability: 'Weekdays after 5 PM',
        mobile: 'No',
        description: 'Focused diagnostic help for check-engine lights, sensors, and drivability issues.',
        city: 'Des Moines',
        phone: '515-555-0132'
      },
      {
        title: 'Seasonal Tire Swap Service',
        serviceType: 'Tire rotations and seasonal changeover',
        experience: '5 years',
        certifications: 'Shop-trained technician',
        rate: '$65 per visit',
        availability: 'Saturday appointments',
        mobile: 'Yes',
        description: 'Fast tire swap appointments for cars and light trucks with owner-supplied wheels.',
        city: 'Huxley',
        phone: '515-555-0133'
      }
    ],
    Cleaning: [
      {
        title: 'Weekly Home Cleaning',
        serviceType: 'Recurring house cleaning',
        residential: 'Yes',
        commercial: 'No',
        rate: '$120 per visit',
        frequency: 'Weekly or biweekly',
        supplies: 'Yes',
        description: 'Reliable residential cleaning with bathrooms, floors, kitchen, and dusting included.',
        city: 'Ames',
        phone: '515-555-0134'
      },
      {
        title: 'Office Evening Cleaning Crew',
        serviceType: 'Small office janitorial',
        residential: 'No',
        commercial: 'Yes',
        rate: '$0.15 per sqft',
        frequency: 'Nightly or three times weekly',
        supplies: 'Yes',
        description: 'After-hours office cleaning including trash, restrooms, and breakroom sanitizing.',
        city: 'West Des Moines',
        phone: '515-555-0135'
      },
      {
        title: 'Move-Out Deep Cleaning',
        serviceType: 'One-time move-out cleaning',
        residential: 'Yes',
        commercial: 'No',
        rate: '$260 flat',
        frequency: 'One-time',
        supplies: 'Yes',
        description: 'Deep clean package for apartments and homes before inspection or listing.',
        city: 'Ames',
        phone: '515-555-0136'
      }
    ],
    Tutoring: [
      {
        title: 'ACT Math and Science Tutor',
        subject: 'ACT Math and Science',
        level: 'High School',
        experience: '6 years',
        rate: '$45 per hour',
        online: 'Yes',
        inPerson: 'Yes',
        description: 'Targeted ACT prep with practice tests, pacing drills, and score tracking.',
        city: 'Ames',
        phone: '515-555-0137'
      },
      {
        title: 'College Calculus Support',
        subject: 'Calculus I and II',
        level: 'Undergraduate',
        experience: '4 years',
        rate: '$35 per hour',
        online: 'Yes',
        inPerson: 'No',
        description: 'Friendly online tutoring for derivatives, integrals, and exam review sessions.',
        city: 'Ames',
        phone: '515-555-0138'
      },
      {
        title: 'Middle School Reading Tutor',
        subject: 'Reading comprehension',
        level: 'Middle School',
        experience: '9 years',
        rate: '$40 per hour',
        online: 'No',
        inPerson: 'Yes',
        description: 'Structured reading support with vocabulary practice and confidence building.',
        city: 'Boone',
        phone: '515-555-0139'
      }
    ],
    Landscaping: [
      {
        title: 'Spring Cleanup and Mulch',
        serviceType: 'Cleanup, edging, and mulch install',
        equipment: 'Trailer, mower, trimmers, blower',
        experience: '7 years',
        rate: '$55 per hour',
        licensed: 'Yes',
        insured: 'Yes',
        description: 'Seasonal yard refresh service for beds, leaves, edging, and fresh mulch.',
        city: 'Ames',
        phone: '515-555-0140'
      },
      {
        title: 'Lawn Mowing Route Openings',
        serviceType: 'Weekly mowing',
        equipment: 'Commercial zero-turn mower',
        experience: '10 years',
        rate: '$42 per visit',
        licensed: 'Yes',
        insured: 'Yes',
        description: 'Consistent mowing service with trimming and cleanup for residential lots.',
        city: 'Ankeny',
        phone: '515-555-0141'
      },
      {
        title: 'Retaining Wall Install Help',
        serviceType: 'Landscape construction',
        equipment: 'Skid steer and compactor available',
        experience: '12 years',
        rate: '$68 per hour',
        licensed: 'No',
        insured: 'Yes',
        description: 'Experienced crew for paver patios, walls, and drainage-focused yard projects.',
        city: 'Johnston',
        phone: '515-555-0142'
      }
    ],
    'Tech Support': [
      {
        title: 'Home Wi-Fi and Printer Setup',
        serviceType: 'Network and device setup',
        experience: '8 years',
        certifications: 'CompTIA A+',
        rate: '$85 per hour',
        remote: 'No',
        onSite: 'Yes',
        description: 'On-site help with router setup, dead zones, printers, and smart home basics.',
        city: 'Ames',
        phone: '515-555-0143'
      },
      {
        title: 'Remote PC Cleanup Service',
        serviceType: 'Virus cleanup and tune-up',
        experience: '6 years',
        certifications: 'Google IT Support',
        rate: '$70 per hour',
        remote: 'Yes',
        onSite: 'No',
        description: 'Remote support for slow Windows laptops, software cleanup, and update issues.',
        city: 'Des Moines',
        phone: '515-555-0144'
      },
      {
        title: 'Small Business IT Help',
        serviceType: 'User support and workstation setup',
        experience: '13 years',
        certifications: 'Network+ and Security+',
        rate: '$95 per hour',
        remote: 'Yes',
        onSite: 'Yes',
        description: 'Practical IT support for office users, laptops, backups, and workstation rollout.',
        city: 'West Des Moines',
        phone: '515-555-0145'
      }
    ]
  },
  Jobs: {
    'Full-Time': [
      {
        title: 'Operations Coordinator',
        company: 'Prairie Supply Co.',
        industry: 'Distribution',
        salary: '$52,000-$58,000',
        experience: '2+ years',
        education: 'Associate or bachelor degree preferred',
        benefits: 'Health insurance, PTO, 401(k), tuition support',
        description: 'Coordinate orders, carrier communication, and reporting for a growing operations team.',
        city: 'Ames',
        phone: '515-555-0146'
      },
      {
        title: 'Civil Engineering Designer',
        company: 'Heartland Site Group',
        industry: 'Engineering',
        salary: '$68,000-$82,000',
        experience: '3+ years AutoCAD Civil 3D',
        education: 'BS in Civil Engineering',
        benefits: 'Hybrid schedule, dental, vision, bonus program',
        description: 'Design grading, utility, and stormwater plans for municipal and private development projects.',
        city: 'Ankeny',
        phone: '515-555-0147'
      },
      {
        title: 'Restaurant General Manager',
        company: 'Downtown Table',
        industry: 'Hospitality',
        salary: '$60,000-$70,000',
        experience: '5+ years restaurant leadership',
        education: 'High school diploma required',
        benefits: 'Paid vacation, bonus eligibility, meal allowance',
        description: 'Lead front-of-house operations, staffing, training, and guest experience for a busy concept.',
        city: 'Des Moines',
        phone: '515-555-0148'
      }
    ],
    'Part-Time': [
      {
        title: 'Campus Event Staff',
        company: 'Cyclone Event Services',
        hours: '20',
        pay: '$16 per hour',
        schedule: 'Evenings and weekends',
        experience: 'Customer service preferred',
        description: 'Help with ticketing, ushering, and guest assistance during university events.',
        city: 'Ames',
        phone: '515-555-0149'
      },
      {
        title: 'Bakery Counter Associate',
        company: 'Sweet Crumb Bakery',
        hours: '18',
        pay: '$15 per hour plus tips',
        schedule: 'Morning shifts Tuesday-Saturday',
        experience: 'Food service helpful but not required',
        description: 'Serve customers, package pastries, and keep the front counter stocked and clean.',
        city: 'Boone',
        phone: '515-555-0150'
      },
      {
        title: 'Library Assistant',
        company: 'Story County Library',
        hours: '24',
        pay: '$17.25 per hour',
        schedule: 'Afternoons and one weekend shift',
        experience: 'Clerical experience preferred',
        description: 'Support circulation desk operations, shelving, and patron account assistance.',
        city: 'Nevada',
        phone: '515-555-0151'
      }
    ],
    Internships: [
      {
        title: 'Marketing Intern',
        company: 'Ames Growth Partners',
        duration: '12 weeks',
        paid: 'Yes',
        credit: 'Yes',
        major: 'Marketing or communications',
        description: 'Support social media campaigns, event promotion, and content scheduling for summer initiatives.',
        city: 'Ames',
        phone: '515-555-0152'
      },
      {
        title: 'Software QA Intern',
        company: 'Midwest SaaS Labs',
        duration: '10 weeks',
        paid: 'Yes',
        credit: 'No',
        major: 'Computer science or software engineering',
        description: 'Assist with manual testing, bug reproduction, and release checklist verification.',
        city: 'Des Moines',
        phone: '515-555-0153'
      },
      {
        title: 'Environmental Field Intern',
        company: 'Prairie Water Solutions',
        duration: 'Summer semester',
        paid: 'No',
        credit: 'Yes',
        major: 'Environmental science or biology',
        description: 'Join field sampling trips and help prepare reports and GIS-ready field notes.',
        city: 'Marshalltown',
        phone: '515-555-0154'
      }
    ],
    Freelance: [
      {
        title: 'Freelance Product Photographer',
        skills: 'Lighting, editing, e-commerce image prep',
        rate: '$75 per hour',
        duration: 'Project-based',
        remote: 'No',
        experience: '6 years commercial photography',
        description: 'Seeking product photography projects for online catalogs, menus, and local retail launches.',
        city: 'Ames',
        phone: '515-555-0155'
      },
      {
        title: 'Contract Copywriter',
        skills: 'Blog writing, email campaigns, SEO basics',
        rate: '$0.30 per word',
        duration: 'Ongoing retainer available',
        remote: 'Yes',
        experience: '8 years agency and in-house writing',
        description: 'Available for website copy, newsletters, and campaign landing page writing projects.',
        city: 'Des Moines',
        phone: '515-555-0156'
      },
      {
        title: 'Freelance CAD Drafter',
        skills: 'AutoCAD, Revit markups, sheet coordination',
        rate: '$42 per hour',
        duration: '2-6 week jobs',
        remote: 'Yes',
        experience: '5 years drafting support',
        description: 'Flexible drafting help for backlog relief, redlines, and permit drawing updates.',
        city: 'Ankeny',
        phone: '515-555-0157'
      }
    ],
    Gigs: [
      {
        title: 'Saturday Moving Help Needed',
        type: 'Moving Labor',
        pay: '$120 for the day',
        schedule: 'Saturday 9 AM - 2 PM',
        requirements: 'Must lift 50 lbs and have reliable transportation.',
        description: 'Need two people to help load a truck and move furniture across town.',
        city: 'Ames',
        phone: '515-555-0158'
      },
      {
        title: 'One-Day Event Setup Crew',
        type: 'Event Setup',
        pay: '$18 per hour',
        schedule: 'Friday noon - 6 PM',
        requirements: 'Comfortable standing and carrying folding tables and signage.',
        description: 'Temporary setup help for banners, chairs, and registration area before a conference.',
        city: 'West Des Moines',
        phone: '515-555-0159'
      },
      {
        title: 'Yard Cleanup Gig',
        type: 'Outdoor Labor',
        pay: '$95 flat',
        schedule: 'Flexible this week',
        requirements: 'Bring gloves and wear outdoor work clothes.',
        description: 'Need help bagging branches, raking, and hauling debris to the curb.',
        city: 'Boone',
        phone: '515-555-0160'
      }
    ]
  },
  Community: {
    Events: [
      {
        title: 'Downtown Summer Market',
        eventName: 'Downtown Summer Market',
        date: '2026-06-13',
        time: '9:00 AM - 1:00 PM',
        venue: 'Main Street Plaza',
        cost: 'Free',
        capacity: '500',
        organizer: 'Ames Main Street',
        description: 'Outdoor market featuring local produce, makers, coffee, and live acoustic music.',
        city: 'Ames',
        phone: '515-555-0161'
      },
      {
        title: 'Community 5K and Walk',
        eventName: 'Story County 5K',
        date: '2026-07-11',
        time: '8:00 AM',
        venue: 'Brookside Park',
        cost: '$25',
        capacity: '300',
        organizer: 'Story County Wellness Coalition',
        description: 'Family-friendly race and walk event with shirt, timing, and post-run refreshments.',
        city: 'Ames',
        phone: '515-555-0162'
      },
      {
        title: 'Outdoor Movie Night',
        eventName: 'Movies in the Park',
        date: '2026-08-07',
        time: '8:45 PM',
        venue: 'Bandshell Park',
        cost: 'Free',
        capacity: '800',
        organizer: 'Parks and Recreation',
        description: 'Bring blankets and lawn chairs for a family movie under the stars.',
        city: 'Boone',
        phone: '515-555-0163'
      }
    ],
    Classes: [
      {
        title: 'Beginner Pottery Wheel Class',
        subject: 'Pottery',
        instructor: 'Mara Jensen',
        schedule: 'Wednesdays at 6 PM for 4 weeks',
        cost: '$140',
        location: 'Clayworks Studio',
        materials: 'Clay and glaze included',
        description: 'Hands-on introduction to wheel throwing, trimming, and glazing techniques.',
        city: 'Ames',
        phone: '515-555-0164'
      },
      {
        title: 'Intro to Home Budgeting',
        subject: 'Personal Finance',
        instructor: 'Eli Thompson',
        schedule: 'Saturday 10 AM - noon',
        cost: '$35',
        location: 'Community Center Room B',
        materials: 'Workbook provided',
        description: 'Practical budgeting class covering saving goals, debt planning, and tracking tools.',
        city: 'Nevada',
        phone: '515-555-0165'
      },
      {
        title: 'Conversational Spanish Basics',
        subject: 'Spanish',
        instructor: 'Lucia Ramirez',
        schedule: 'Tuesdays and Thursdays at 7 PM',
        cost: '$90',
        location: 'West Side Library',
        materials: 'Notebook and pen needed',
        description: 'Beginner language practice focused on greetings, travel phrases, and daily conversation.',
        city: 'Ames',
        phone: '515-555-0166'
      }
    ],
    Volunteers: [
      {
        title: 'Food Pantry Shelf Stockers',
        organization: 'Story County Food Pantry',
        role: 'Stock shelves and pack bags',
        commitment: 'Two 3-hour shifts per month',
        skills: 'Friendly attitude and light lifting',
        cause: 'Reduce food insecurity in the county',
        description: 'Volunteers help receive donations, sort pantry items, and prepare pickup orders.',
        city: 'Ames',
        phone: '515-555-0167'
      },
      {
        title: 'Trail Cleanup Volunteers',
        organization: 'Friends of Ada Hayden',
        role: 'Park and trail cleanup',
        commitment: 'Saturday mornings once a month',
        skills: 'Outdoor stamina and teamwork',
        cause: 'Preserve public recreation spaces',
        description: 'Join neighbors picking up litter, clearing small debris, and improving trail access.',
        city: 'Ames',
        phone: '515-555-0168'
      },
      {
        title: 'Reading Buddy Volunteers',
        organization: 'Boone Youth Literacy',
        role: 'Read with elementary students',
        commitment: 'One hour per week',
        skills: 'Patience and encouragement with children',
        cause: 'Support literacy growth and confidence',
        description: 'Help young readers practice fluency and enjoy books in a supportive setting.',
        city: 'Boone',
        phone: '515-555-0169'
      }
    ],
    Groups: [
      {
        title: 'Board Game Night Group',
        groupName: 'Ames Tabletop Collective',
        type: 'Hobby Group',
        meetingTime: 'Fridays at 7 PM',
        location: 'North Grand Community Room',
        size: '20 regular members',
        requirements: 'All experience levels welcome',
        description: 'Weekly game night with strategy, party, and co-op games for adults.',
        city: 'Ames',
        phone: '515-555-0170'
      },
      {
        title: 'Weekend Running Club',
        groupName: 'Prairie Pace Crew',
        type: 'Fitness Group',
        meetingTime: 'Sundays at 8 AM',
        location: 'Brookside Park Trailhead',
        size: '15-25 runners',
        requirements: 'Able to run or jog 3 miles',
        description: 'Social running group with route options, pace groups, and coffee after.',
        city: 'Ames',
        phone: '515-555-0171'
      },
      {
        title: 'Young Professionals Meetup',
        groupName: 'Central Iowa YP Meetup',
        type: 'Networking Group',
        meetingTime: 'Second Thursday monthly at 6 PM',
        location: 'Rotating local venues',
        size: '40 members',
        requirements: 'Open to early-career professionals',
        description: 'Casual networking, speaker nights, and local business spotlights.',
        city: 'Des Moines',
        phone: '515-555-0172'
      }
    ],
    'Lost + Found': [
      {
        title: 'Found Black Lab Near Park',
        itemType: 'Dog',
        color: 'Black',
        location: 'Near Inis Grove Park',
        date: '2026-04-20',
        reward: 'No',
        contact: 'Text with identifying details',
        description: 'Friendly black lab found without tags, currently safe and being cared for.',
        city: 'Ames',
        phone: '515-555-0173'
      },
      {
        title: 'Lost AirPods Case',
        itemType: 'Electronics',
        color: 'White',
        location: 'Campus library second floor',
        date: '2026-04-18',
        reward: '$20',
        contact: 'Call if found',
        description: 'White AirPods case lost near study tables by the east windows.',
        city: 'Ames',
        phone: '515-555-0174'
      },
      {
        title: 'Found Bike Helmet on Trail',
        itemType: 'Helmet',
        color: 'Blue',
        location: 'High Trestle connector trail',
        date: '2026-04-22',
        reward: 'No',
        contact: 'Email with brand and size',
        description: 'Bike helmet left near a bench on the trail entrance, stored safely.',
        city: 'Madrid',
        phone: '515-555-0175'
      }
    ]
  }
}

function parseArgs(argv) {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (!value.startsWith('--')) {
      continue
    }

    const key = value.slice(2)
    const nextValue = argv[index + 1]
    if (!nextValue || nextValue.startsWith('--')) {
      args[key] = true
      continue
    }

    args[key] = nextValue
    index += 1
  }

  return args
}

function resolveTableName(args) {
  if (process.env.LISTINGS_TABLE) {
    return process.env.LISTINGS_TABLE
  }

  if (args.table) {
    return args.table
  }

  const stage = args.stage || 'dev'
  return `marketplace-listings-${stage}`
}

function buildSeedListings() {
  const listings = []
  let userOffset = 0
  let createdAtOffset = 0

  for (const [section, categories] of Object.entries(CATEGORY_FIXTURES)) {
    for (const [category, fixtures] of Object.entries(categories)) {
      for (const fixture of fixtures) {
        listings.push({
          id: randomUUID(),
          section,
          category,
          userId: USER_IDS[userOffset % USER_IDS.length],
          createdAt: new Date(Date.UTC(2026, 3, 1 + createdAtOffset, 15, 0, 0)).toISOString(),
          ...fixture
        })

        userOffset += 1
        createdAtOffset += 1
      }
    }
  }

  return listings
}

async function seedListings() {
  const args = parseArgs(process.argv.slice(2))
  const tableName = resolveTableName(args)
  const docClient = getDocClient()
  const listings = buildSeedListings()

  if (listings.length !== 75) {
    throw new Error(`Expected 75 listings but built ${listings.length}`)
  }

  if (args['dry-run']) {
    console.log(`Dry run only. Would seed ${listings.length} listings into ${tableName}.`)
    console.log(JSON.stringify(listings.slice(0, 3), null, 2))
    return
  }

  for (const listing of listings) {
    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: listing
      })
    )
  }

  console.log(`Seeded ${listings.length} listings into ${tableName}.`)
}

seedListings().catch((error) => {
  console.error('Failed to seed listings:', error)
  process.exitCode = 1
})
