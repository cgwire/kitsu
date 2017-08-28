import flask_bcrypt as bcrypt
from test.base import ApiDBTestCase

from zou.app.utils import auth

from zou.app.services.exception import PersonNotFoundException
from zou.app.services import persons_service


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

    def test_load_user(self):
        person = persons_service.get_person(self.person.id)
        self.assertEqual(person.id, self.person.id)
        person.delete()
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_person,
            self.person.id
        )

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
            PersonNotFoundException,
            auth.check_credentials,
            "john.doe@yahoo.com",
            "mypassword2"
        )
        self.assertTrue(
            auth.check_credentials("john.doe@gmail.com", "mypassword"))

    def test_get_person_by_username(self):
        person = auth.get_person_by_username("john.doe@gmail.com")
        self.assertEquals(person["first_name"], "John")
        self.assertRaises(
            PersonNotFoundException,
            auth.get_person_by_username,
            "ema.doe@yahoo.com"
        )

    def test_no_password_auth_strategy(self):
        person = auth.no_password_auth_strategy("john.doe@gmail.com")
        self.assertEquals(person["first_name"], "John")

    def test_local_auth_strategy(self):
        self.person.update({
            "password": auth.encrypt_password("mypassword")
        })
        self.assertRaises(
            auth.WrongPasswordException,
            auth.local_auth_strategy,
            "john.doe@gmail.com",
            "mypassword2"
        )
        self.assertRaises(
            PersonNotFoundException,
            auth.local_auth_strategy,
            "john.doe@yahoo.com",
            "mypassword2"
        )
        person = auth.local_auth_strategy("john.doe@gmail.com", "mypassword")
        self.assertEquals(person["first_name"], "John")

