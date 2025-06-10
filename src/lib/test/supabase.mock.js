const supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            nombre: "2006 Renault Alonso",
            Team: "renault",
            año: 2006,
            driver: "Alonso",
          },
          {
            id: 2,
            nombre: "Red Bull Racing 2023 Verstappen",
            Team: "Redbull",
            año: 2023,
            driver: "Verstappen",
          },
        ],
        error: null,
      })
    ),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [], error: null })),
    delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
};

module.exports = { supabase };