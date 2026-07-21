import prisma from '../src/db';

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Cleanup existing data (in FK-safe order)
  await prisma.assignment.deleteMany();
  await prisma.phoneNumber.deleteMany();
  await prisma.forfait.deleteMany();
  await prisma.employee.deleteMany();
  console.log('🧹 Base de données nettoyée');

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        fullName: 'Ahmed Benali',
        department: 'Informatique',
        position: 'Responsable IT',
        email: 'ahmed.benali@sos-villages.ma',
        status: 'Actif',
        site: 'Rabat',
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Fatima Zahra Alaoui',
        department: 'Ressources Humaines',
        position: 'Chargée RH',
        email: 'fatima.alaoui@sos-villages.ma',
        status: 'Actif',
        site: 'Casablanca',
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Youssef Idrissi',
        department: 'Finance',
        position: 'Comptable',
        email: 'youssef.idrissi@sos-villages.ma',
        status: 'Actif',
        site: 'Marrakech',
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Nadia Cherkaoui',
        department: 'Direction',
        position: 'Directrice Générale',
        email: 'nadia.cherkaoui@sos-villages.ma',
        status: 'Actif',
        site: 'Casablanca',
      },
    }),
    prisma.employee.create({
      data: {
        fullName: 'Karim Mansouri',
        department: 'Éducation',
        position: 'Éducateur',
        email: 'karim.mansouri@sos-villages.ma',
        status: 'Inactif',
        site: 'Agadir',
      },
    }),
  ]);

  console.log(`✅ ${employees.length} employés créés`);

  // Create forfaits — real professional/business plans from Moroccan operators
  console.log('🌱 Création des forfaits...');
  const forfaits = await Promise.all([
    // --- MAROC TELECOM (IAM) ---
    prisma.forfait.create({ data: { name: 'Optimis 119 DH', price: 119.0, operator: 'Maroc Telecom', description: '29 Go data 4G/5G + 1h d\'appels nationaux' } }),
    prisma.forfait.create({ data: { name: 'Optimis 199 DH', price: 199.0, operator: 'Maroc Telecom', description: '50 Go data 4G/5G + 1h30 d\'appels + 1 Go roaming Zone 1' } }),
    prisma.forfait.create({ data: { name: 'Optimis 259 DH', price: 259.0, operator: 'Maroc Telecom', description: '65 Go data 4G/5G + 3h d\'appels + 2 Go roaming + Glovo Prime' } }),
    prisma.forfait.create({ data: { name: 'Optimis 329 DH', price: 329.0, operator: 'Maroc Telecom', description: '80 Go data 4G/5G + 4h d\'appels + 3 Go roaming + TOD + StarzPlay' } }),
    prisma.forfait.create({ data: { name: 'Optimis 479 DH', price: 479.0, operator: 'Maroc Telecom', description: '100 Go data 4G/5G + 20h d\'appels nationaux + 4 Go roaming' } }),
    prisma.forfait.create({ data: { name: 'Optimis Illimité 699 DH', price: 699.0, operator: 'Maroc Telecom', description: 'Appels & SMS illimités + Internet illimité (250 Go 4G/5G) + 5 Go roaming + divertissement' } }),
    prisma.forfait.create({ data: { name: 'Forfait Pro 40H/30Go 230 DH', price: 230.0, operator: 'Maroc Telecom', description: '40h d\'appels + 30 Go data (avec engagement 12 mois)' } }),
    prisma.forfait.create({ data: { name: 'Forfait Pro 50H/40Go 288 DH', price: 288.0, operator: 'Maroc Telecom', description: '50h d\'appels + 40 Go data (avec engagement 12 mois)' } }),

    // --- ORANGE MAROC ---
    prisma.forfait.create({ data: { name: 'Orange Pro Connect 59 DH', price: 59.0, operator: 'Orange Maroc', description: 'Data + Appels + Réseaux sociaux illimités (WhatsApp, Facebook, Instagram...)' } }),
    prisma.forfait.create({ data: { name: 'Orange Pro 99 DH', price: 99.0, operator: 'Orange Maroc', description: '18 Go data + Heures d\'appels nationaux + Pass réseaux sociaux' } }),
    prisma.forfait.create({ data: { name: 'Orange Pro 149 DH', price: 149.0, operator: 'Orange Maroc', description: '30 Go data + Appels nationaux + Réseaux sociaux illimités' } }),
    prisma.forfait.create({ data: { name: 'Orange Pro 249 DH', price: 249.0, operator: 'Orange Maroc', description: '50 Go data + Appels illimités nationaux + Réseaux sociaux illimités' } }),
    prisma.forfait.create({ data: { name: 'Orange Pro Illimité 399 DH', price: 399.0, operator: 'Orange Maroc', description: 'Appels & SMS illimités + Internet illimité + Avantages roaming + Services internationaux' } }),

    // --- INWI ---
    prisma.forfait.create({ data: { name: 'Inwi Business Data 99 DH', price: 99.0, operator: 'Inwi', description: '35 Go data 4G/5G + 1h d\'appels + Service Rappelez-moi' } }),
    prisma.forfait.create({ data: { name: 'Inwi Business Data 199 DH', price: 199.0, operator: 'Inwi', description: '80 Go data 4G/5G + 1h d\'appels + Service Rappelez-moi' } }),
    prisma.forfait.create({ data: { name: 'Inwi Business Data 299 DH', price: 299.0, operator: 'Inwi', description: '100 Go data 4G/5G + 1h d\'appels + Service Rappelez-moi' } }),
    prisma.forfait.create({ data: { name: 'Inwi Business Data 399 DH', price: 399.0, operator: 'Inwi', description: '140 Go data 4G/5G + 1h d\'appels + Service Rappelez-moi' } }),
    prisma.forfait.create({ data: { name: 'Inwi Business Tout-en-un 200 DH', price: 200.0, operator: 'Inwi', description: '50 Go data + Appels + Illimité intra-flotte + Appels illimités vers tous les Inwi' } }),
    prisma.forfait.create({ data: { name: 'Inwi Business Tout-en-un 299 DH', price: 299.0, operator: 'Inwi', description: '70 Go data + Appels nationaux + Appels illimités intra-flotte + Roaming international' } }),
  ]);
  console.log(`✅ ${forfaits.length} forfaits créés`);

  // Create phone numbers
  const phoneNumbers = await Promise.all([
    prisma.phoneNumber.create({
      data: {
        phoneNumber: '+212 600 000 001',
        provider: 'Maroc Telecom',
        status: 'Disponible',
        lineStatus: 'Actif',
        notes: 'Ligne principale direction',
        forfaitId: forfaits[1].id, // Optimis 199 DH
      },
    }),
    prisma.phoneNumber.create({
      data: {
        phoneNumber: '+212 600 000 002',
        provider: 'Orange Maroc',
        status: 'Disponible',
        lineStatus: 'Actif',
        notes: '',
        forfaitId: forfaits[9].id, // Orange Pro 99 DH
      },
    }),
    prisma.phoneNumber.create({
      data: {
        phoneNumber: '+212 600 000 003',
        provider: 'Inwi',
        status: 'Disponible',
        lineStatus: 'Actif',
        notes: 'Ligne data uniquement',
        forfaitId: forfaits[14].id, // Inwi Business Data 99 DH
      },
    }),
    prisma.phoneNumber.create({
      data: {
        phoneNumber: '+212 600 000 004',
        provider: 'Maroc Telecom',
        status: 'Disponible',
        lineStatus: 'Actif',
        notes: '',
        forfaitId: forfaits[0].id, // Optimis 119 DH
      },
    }),
    prisma.phoneNumber.create({
      data: {
        phoneNumber: '+212 600 000 005',
        provider: 'Orange Maroc',
        status: 'Indisponible',
        lineStatus: 'Inactif',
        notes: 'En panne - envoyée en réparation',
        forfaitId: forfaits[11].id, // Orange Pro 249 DH
      },
    }),
  ]);

  console.log(`✅ ${phoneNumbers.length} numéros de téléphone créés`);

  // Create some assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      employeeId: employees[3].id, // Nadia Cherkaoui
      phoneNumberId: phoneNumbers[0].id, // +212 600 000 001
      assignedAt: new Date('2025-01-05'),
      returnedAt: new Date('2025-03-12'),
      assignedBy: 'Admin IT',
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      employeeId: employees[0].id, // Ahmed Benali
      phoneNumberId: phoneNumbers[0].id, // +212 600 000 001
      assignedAt: new Date('2025-03-13'),
      returnedAt: new Date('2025-06-20'),
      assignedBy: 'Admin IT',
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      employeeId: employees[1].id, // Fatima
      phoneNumberId: phoneNumbers[0].id, // +212 600 000 001 (current)
      assignedAt: new Date('2025-06-21'),
      returnedAt: null,
      assignedBy: 'Admin IT',
    },
  });

  // Update phone number status to Attribué
  await prisma.phoneNumber.update({
    where: { id: phoneNumbers[0].id },
    data: { status: 'Attribué' },
  });

  // Another active assignment
  await prisma.assignment.create({
    data: {
      employeeId: employees[3].id, // Nadia
      phoneNumberId: phoneNumbers[3].id, // +212 600 000 004
      assignedAt: new Date('2025-07-01'),
      returnedAt: null,
      assignedBy: 'Admin IT',
    },
  });

  await prisma.phoneNumber.update({
    where: { id: phoneNumbers[3].id },
    data: { status: 'Attribué' },
  });

  console.log('✅ Attributions créées');
  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
