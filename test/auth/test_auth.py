import flask_bcrypt as bcrypt
from test.base import ApiDBTestCase

from zou.app.utils import auth

from zou.app.project.exception import PersonNotFoundException
from zou.app.project import person_info


class AuthTestCase(ApiDBTestCase):

    def setUp(self):
        super(AuthTestCase, self).setUp()

        self.generate_fixture_person()
        self.person.update({
            "password": auth.encrypt_password("secretpassword")
        })

        self.person_dict = self.person.serialize()
        self.credentials = {
            "email": self.person_dict["email"],
            "password": "secretpassword"
        }

    def test_user_to_dict(self):
        user = auth.User(
            id=self.person.id,
            email="john.doe@gmail.com",
            first_name="John",
            last_name="Doe"
        )
        self.assertEqual(user.to_dict(), {
            "id": str(self.person.id),
            "email": u"john.doe@gmail.com",
            "first_name": u"John",
            "last_name": u"Doe"
        })

    def test_load_user(self):
        person = person_info.get_person(self.person.id)
        self.assertEqual(person.id, self.person.id)
        person.delete()
        self.assertRaises(
            PersonNotFoundException,
            person_info.get_person,
            self.person.id
        )

    def test_person_to_user(self):
        user = auth.person_to_user(self.person)
        self.assertEqual(user.to_dict(), {
            "id": str(self.person.id),
            "email": u"john.doe@gmail.com",
            "first_name": u"John",
            "last_name": u"Doe"
        })

    def test_get_user_by_email(self):
        user = auth.get_user_by_email(self.person.email)
        self.assertEqual(user.to_dict(), {
            "id": str(self.person.id),
            "email": u"john.doe@gmail.com",
            "first_name": u"John",
            "last_name": u"Doe"
        })

    def test_encrypt_password(self):
        password = "my secret"
        pass_hash = auth.encrypt_password(password)
        self.assertGreater(len(pass_hash), len(password))
        self.assertNotEqual(pass_hash, password)
        self.assertTrue(bcrypt.check_password_hash(pass_hash, password))

    def test_validate_email(self):
        self.assertEqual(
            auth.validate_email("john@gmail.com"),
            "john@gmail.com"
        )
        self.assertRaises(
            auth.EmailNotValidException,
            auth.validate_email,
            "johngmail.com"
        )

    def test_validate_password(self):
        self.assertRaises(
            auth.PasswordTooShortException,
            auth.validate_password,
            "12345",
            "12345"
        )
        self.assertRaises(
            auth.PasswordsNoMatchException,
            auth.validate_password,
            "12345678",
            "12345676"
        )
        self.assertTrue(
            auth.validate_password("mypassword", "mypassword")
        )

    def test_check_credentials(self):
        self.person.update({
            "password": auth.encrypt_password("mypassword")
        })
        self.assertRaises(
            auth.WrongPasswordException,
            auth.check_credentials,
            "john.doe@gmail.com",
            "mypassword2"
        )
        self.assertRaises(
            auth.PersonNotFoundException,
            auth.check_credentials,
            "john.doe@yahoo.com",
            "mypassword2"
        )
        self.assertTrue(
            auth.check_credentials("john.doe@gmail.com", "mypassword"))
