const mockUser = {
  uid: '123abc',
  email: 'test@example.com',
  displayName: 'Test User',
};

const auth = {
  currentUser: null,
  signOut: jest.fn(() => Promise.resolve()),
};

const signInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: mockUser })
);

const signInWithPopup = jest.fn(() =>
  Promise.resolve({ user: mockUser })
);

const GoogleAuthProvider = jest.fn();

const onAuthStateChanged = jest.fn((authInstance, callback) => {
  callback(mockUser);
  return () => {};
});

const getAuth = jest.fn(() => auth);

module.exports = {
  mockUser,
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  getAuth,
};