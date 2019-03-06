.. figure:: https://zou.cg-wire.com/zou.png
   :alt: Zou Logo

Zou is the memory of your CG production
---------------------------------------

Zou is an API that stores and manages data pertaining to CG
production, while also enabling synchronization via pipelining of tools. 

A dedicated Python client, `Gazu <https://gazu.cg-wire.com>`_, allows users to integrate Zou into the tools. 

|Build badge|

|Gitter badge|

Features
~~~~~~~~

Zou can:

-  Store production data, such as projects, shots, assets, tasks, metadata files,
   and validations.
-  Provide folder and file paths for any task.
-  Import data from Shotgun or CSV files.
-  Export main data to CSV files.
-  Provide helpers to manage workflow tasks (start, publish, retake).
-  Listen to events to plug external modules on it.

Installation and documentation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Installation of Zou requires the setup of third-party tools such as a database instance, so it is recommended
to the follow the documentation:

`https://zou.cg-wire.com/ <https://zou.cg-wire.com>`__

Contributing
------------

Contributions are welcomed so long as the `C4
contract <https://rfc.zeromq.org/spec:42/C4>`__ is respected.

Zou is based on Python and the `Flask <http://flask.pocoo.org/>`__
framework.

Instructions for setting up a development environment are available in
`the documentation <https://zou.cg-wire.com/development/>`__


Sponsors
~~~~~~~~

|Unit Image Logo|
|Les Fées Spéciales Logo|
|NKI Logo|

About authors
~~~~~~~~~~~~~

Zou is written by CG Wire, a company based in France. We help small to
midsize CG studios to manage their production and build pipeline
efficiently.

We apply software craftsmanship principles as much as possible. We love
coding and consider strong qualities and good developer experience to
matter a lot. Through our diverse experiences, we enable studios to produce quality
software, so that they can focus more on the artistic work.

Visit `cg-wire.com <https://cg-wire.com>`__ for more information.

|CGWire Logo|

.. |Build badge| image:: https://travis-ci.org/cgwire/zou.svg?branch=master
   :target: https://travis-ci.org/cgwire/zou
.. |Gitter badge| image:: https://badges.gitter.im/cgwire/Lobby.png
   :target: https://gitter.im/cgwire/Lobby
.. |CGWire Logo| image:: https://zou.cg-wire.com/cgwire.png
   :target: https://cgwire.com
.. |Unit Image Logo| image:: https://www.cg-wire.com/images/logo-unit-image.png
   :target: https://www.unit-image.fr
.. |Les Fées Spéciales Logo| image:: https://www.cg-wire.com/images/logo-les-fees-speciales.png
   :target: https://www.les-fees-speciales.coop
.. |NKI Logo| image:: https://www.cg-wire.com/images/logo-nki.png
   :target: https://www.nki.tv
