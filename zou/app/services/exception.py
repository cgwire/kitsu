from werkzeug.exceptions import NotFound


class EpisodeNotFoundException(NotFound):
    pass


class SequenceNotFoundException(NotFound):
    pass


class ShotNotFoundException(NotFound):
    pass


class SceneNotFoundException(NotFound):
    pass


class AssetNotFoundException(NotFound):
    pass


class AssetInstanceNotFoundException(NotFound):
    pass


class AssetTypeNotFoundException(NotFound):
    pass


class TaskNotFoundException(NotFound):
    pass


class DepartmentNotFoundException(NotFound):
    pass


class TaskStatusNotFoundException(NotFound):
    pass


class TaskTypeNotFoundException(NotFound):
    pass


class PersonNotFoundException(NotFound):
    pass


class ProjectNotFoundException(NotFound):
    pass


class WorkingFileNotFoundException(NotFound):
    pass


class OutputFileNotFoundException(NotFound):
    pass


class SoftwareNotFoundException(NotFound):
    pass


class OutputTypeNotFoundException(NotFound):
    pass


class PreviewFileNotFoundException(NotFound):
    pass


class CommentNotFoundException(NotFound):
    pass


class EntityNotFoundException(NotFound):
    pass


class EntityTypeNotFoundException(NotFound):
    pass


class PlaylistNotFoundException(NotFound):
    pass


class SearchFilterNotFoundException(NotFound):
    pass


class NotificationNotFoundException(NotFound):
    pass


class SubscriptionNotFoundException(NotFound):
    pass


class MetadataDescriptorNotFoundException(NotFound):
    pass


class MalformedFileTreeException(Exception):
    pass


class WrongFileTreeFileException(Exception):
    pass


class WrongPathFormatException(Exception):
    pass


class NoOutputFileException(Exception):
    pass


class NoAuthStrategyConfigured(Exception):
    pass


class WrongUserException(Exception):
    pass


class WrongPasswordException(Exception):
    pass


class UnactiveUserException(Exception):
    pass


class WrongDateFormatException(Exception):
    pass


class EntryAlreadyExistsException(Exception):
    pass


class ArgumentsException(Exception):
    pass


class WrongIdFormatException(Exception):
    pass


class WrongParameterException(Exception):
    pass
