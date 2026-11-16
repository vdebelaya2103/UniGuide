
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    interests = relationship("UserInterest", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)

    activities = relationship("Activity", back_populates="category")
    user_interests = relationship("UserInterest", back_populates="category")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    event_date = Column(DateTime)
    location = Column(String(255))
    participation_info = Column(Text)
    registration_url = Column(String(500))

    category = relationship("Category", back_populates="activities")
    favorites = relationship("Favorite", back_populates="activity")


class UserInterest(Base):
    __tablename__ = "user_interests"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), primary_key=True)

    user = relationship("User", back_populates="interests")
    category = relationship("Category", back_populates="user_interests")


class Favorite(Base):
    __tablename__ = "favorites"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), primary_key=True)

    user = relationship("User", back_populates="favorites")
    activity = relationship("Activity", back_populates="favorites")
