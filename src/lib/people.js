// The role a person holds in a production: the project override, else the
// global role. Admins ignore the overrides (zou refuses to set one on them,
// but a stale link role can linger from before a promotion to admin).
export const getProductionRole = (person, projectRoles = {}) =>
  (person.role !== 'admin' && projectRoles[person.id]) || person.role

// The persons of a department holding a production role, 'all' and an
// empty department standing for no filter.
export const filterPeople = (
  people,
  { departmentId = '', role = 'all', projectRoles = {} }
) =>
  people.filter(
    person =>
      (role === 'all' || getProductionRole(person, projectRoles) === role) &&
      (!departmentId || person.departments?.includes(departmentId))
  )

// The role filter of the team listings, 'all' standing for no filter.
export const roleOptions = [
  'all',
  'admin',
  'manager',
  'supervisor',
  'user',
  'vendor'
].map(name => ({ label: name, value: name }))
