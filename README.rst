.. figure:: https://zou.cg-wire.com/zou.png
   :alt: Zou Logo

Zou is the memory of your CG production
---------------------------------------

Zou is an API that allows to store and manage the data of your CG
production. Through it you can link all the tools of your pipeline and
make sure they are all synchronized. 

To integrate it quickly in your tools you can rely on the dedicated
Python client named `Gazu <https://gazu.cg-wire.com>`__. 

|Build badge|

|Gitter badge|

Features
~~~~~~~~

Zou can:

-  Store production data: projects, shots, assets, tasks, files metadata
   and validations.
-  Provide folder and file paths for any task.
-  Data import from Shotgun or CSV files.
-  Export main data to CSV files.
-  Provide helpers to manage task workflow (start, publish, retake).
-  Listen to events to plug external modules on it.

Installation and documentation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Installation of Zou itself is pretty straightforward but it requires the
setup of third-parties tool like a database instance. So we recommend
you to jump directly to the full documentation:

`https://zou.cg-wire.com/ <https://zou.cg-wire.com>`__

Contributing
------------

All contributions are welcome as long as they respect the `C4
contract <https://rfc.zeromq.org/spec:42/C4>`__.

Zou is based on Python and the `Flask <http://flask.pocoo.org/>`__
framework.

Instruction for setting up a development environment are available in
`the documentation <https://zou.cg-wire.com/development/>`__


Sponsors
~~~~~~~~

|Unit Image Logo|
|Les Fées Spéciales Logo|

About authors
~~~~~~~~~~~~~

Gazu is written by CG Wire, a company based in France. We help small to
midsize CG studios to manage their production and build pipeline
efficiently.

We apply software craftmanship principles as much as possible. We love
coding and consider that strong quality and good developer experience
matter a lot. Through our diverse experiences, we allow studios to get
better at doing software and focus more on the artistic work.

Visit `cg-wire.com <https://cg-wire.com>`__ for more information.

|CGWire Logo|

.. |Build badge| image:: https://travis-ci.org/cgwire/zou.svg?branch=master
   :target: https://travis-ci.org/cgwire/zou
.. |Gitter badge| image:: https://badges.gitter.im/cgwire/Lobby.png
   :target: https://gitter.im/cgwire/Lobby
.. |CGWire Logo| image:: https://zou.cg-wire.com/cgwire.png
   :target: https://cgwire.com
.. |Unit Image Logo| image:: https://www.unit-image.fr
   :target: https://cgwire.com
.. |Les Fées Spéciales Logo| image:: https://www.les-fees-speciales.coop
   :target: https://cgwire.com
